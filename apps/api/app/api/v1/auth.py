from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.organization import Organization
from app.models.user import AuthProvider, User, UserRole
from app.schemas.auth import (
    ExchangeRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SignupRequest,
    SignupResponse,
    TokenPair,
    VerifyOtpRequest,
)
from app.services.auth import oauth_state, otp, password_reset
from app.services.auth.github import NoVerifiedEmailError
from app.services.auth.github import build_authorize_url as build_github_authorize_url
from app.services.auth.github import fetch_profile as fetch_github_profile
from app.services.auth.google import build_authorize_url, fetch_profile
from app.services.auth.slug import slugify
from app.services.auth.user_resolution import (
    EmailNotVerifiedError,
    resolve_or_create_github_user,
    resolve_or_create_user,
)
from app.services.email.sendlib import (
    send_otp_email,
    send_password_reset_email,
    send_welcome_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_tokens(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(str(user.id), str(user.organization_id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


async def _issue_tokens_and_redirect(user: User) -> RedirectResponse:
    """Issue our own tokens for a resolved user and hand the browser back to
    the frontend with a one-time code instead of the raw tokens.
    """
    exchange_code = await oauth_state.create_exchange_code(_issue_tokens(user).model_dump_json())
    frontend_url = get_settings().frontend_url
    return RedirectResponse(f"{frontend_url}/auth/callback?code={exchange_code}")


@router.get("/google/login")
async def google_login() -> RedirectResponse:
    """Start the flow: send the browser to Google's consent screen."""
    state = await oauth_state.create_state()
    return RedirectResponse(build_authorize_url(state))


@router.get("/google/callback")
async def google_callback(
    code: str, state: str, db: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    """Google redirects here with a code. Resolve the user, issue our own
    tokens, and hand the browser back to the frontend with a one-time code
    instead of the raw tokens.
    """
    if not await oauth_state.consume_state(state):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired state.")

    profile = await fetch_profile(code)

    try:
        user = await resolve_or_create_user(db, profile)
    except EmailNotVerifiedError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists. Sign in with your "
            "password first, then connect Google from Settings.",
        ) from exc

    return await _issue_tokens_and_redirect(user)


@router.get("/github/login")
async def github_login() -> RedirectResponse:
    """Start the flow: send the browser to GitHub's consent screen."""
    state = await oauth_state.create_state()
    return RedirectResponse(build_github_authorize_url(state))


@router.get("/github/callback")
async def github_callback(
    code: str, state: str, db: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    """GitHub redirects here with a code. Resolve the user, issue our own
    tokens, and hand the browser back to the frontend with a one-time code
    instead of the raw tokens.
    """
    if not await oauth_state.consume_state(state):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired state.")

    try:
        profile = await fetch_github_profile(code)
    except NoVerifiedEmailError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Your GitHub account has no verified email. Verify an email on "
            "GitHub and try again.",
        ) from exc

    try:
        user = await resolve_or_create_github_user(db, profile)
    except EmailNotVerifiedError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists. Sign in with your "
            "password first, then connect GitHub from Settings.",
        ) from exc

    return await _issue_tokens_and_redirect(user)


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)) -> SignupResponse:
    """Create the account (unverified), email a code, and wait for /verify-otp."""
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()

    if existing is not None:
        if existing.email_verified:
            raise HTTPException(
                status.HTTP_409_CONFLICT, "An account with this email already exists."
            )
        existing.name = payload.name
        existing.password_hash = hash_password(payload.password)
        await db.commit()
    else:
        organization = Organization(name=payload.organization, slug=slugify(payload.organization))
        user = User(
            email=payload.email,
            name=payload.name,
            password_hash=hash_password(payload.password),
            auth_provider=AuthProvider.password,
            email_verified=False,
            role=UserRole.owner,
            organization=organization,
        )
        db.add(organization)
        db.add(user)
        await db.commit()

    code = otp.generate_code()
    await otp.store_code(payload.email, code)
    await send_otp_email(to=payload.email, name=payload.name, code=code)

    return SignupResponse(message="Verification code sent.")


@router.post("/verify-otp", response_model=TokenPair)
async def verify_otp(
    payload: VerifyOtpRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> TokenPair:
    if not await otp.verify_code(payload.email, payload.code):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account found for this email.")

    user.email_verified = True
    await db.commit()

    organization = await db.get(Organization, user.organization_id)
    background_tasks.add_task(
        send_welcome_email,
        to=user.email,
        name=user.name or user.email.split("@")[0],
        organization=organization.name if organization else "Your organization",
    )

    return _issue_tokens(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    valid = user is not None and user.password_hash is not None
    valid = valid and verify_password(payload.password, user.password_hash)
    if not valid:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")
    if not user.email_verified:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Verify your email before signing in.")

    return _issue_tokens(user)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> ForgotPasswordResponse:
    """Email a single-use reset link. Always answers the same way whether or
    not the address has an account, so the endpoint can't be used to check
    which emails are registered.
    """
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is not None:
        token = await password_reset.create_token(user.email)
        background_tasks.add_task(
            send_password_reset_email,
            to=user.email,
            name=user.name or user.email.split("@")[0],
            token=token,
        )

    return ForgotPasswordResponse(
        message="If an account exists for that email, a reset link is on its way."
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
) -> ResetPasswordResponse:
    """Swap a valid reset token for a new password. Following the emailed
    link proves control of the inbox, so an unverified account gets verified
    here too.
    """
    email = await password_reset.consume_token(payload.token)
    if email is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired."
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account found for this email.")

    user.password_hash = hash_password(payload.password)
    user.email_verified = True
    await db.commit()

    return ResetPasswordResponse(message="Your password has been updated.")


@router.post("/exchange", response_model=TokenPair)
async def exchange(payload: ExchangeRequest) -> TokenPair:
    """The frontend swaps the one-time code from the callback redirect for
    the real tokens. Each code works exactly once.
    """
    stored = await oauth_state.consume_exchange_code(payload.code)
    if stored is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")
    return TokenPair.model_validate_json(stored)
