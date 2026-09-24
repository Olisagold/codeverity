from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
from app.schemas.auth import ExchangeRequest, TokenPair
from app.services.auth import oauth_state
from app.services.auth.google import build_authorize_url, fetch_profile
from app.services.auth.user_resolution import EmailNotVerifiedError, resolve_or_create_user

router = APIRouter(prefix="/auth", tags=["auth"])


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

    tokens = TokenPair(
        access_token=create_access_token(str(user.id), str(user.organization_id)),
        refresh_token=create_refresh_token(str(user.id)),
    )
    exchange_code = await oauth_state.create_exchange_code(tokens.model_dump_json())

    frontend_url = get_settings().frontend_url
    return RedirectResponse(f"{frontend_url}/auth/callback?code={exchange_code}")


@router.post("/exchange", response_model=TokenPair)
async def exchange(payload: ExchangeRequest) -> TokenPair:
    """The frontend swaps the one-time code from the callback redirect for
    the real tokens. Each code works exactly once.
    """
    stored = await oauth_state.consume_exchange_code(payload.code)
    if stored is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")
    return TokenPair.model_validate_json(stored)
