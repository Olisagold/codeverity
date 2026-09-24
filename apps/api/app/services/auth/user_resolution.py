"""Turning a verified OAuth profile (Google or GitHub) into a `User` row."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.user import AuthProvider, User, UserRole
from app.services.auth.github import GithubProfile
from app.services.auth.google import GoogleProfile
from app.services.auth.slug import slugify

# Which User column holds each provider's stable account id.
_PROVIDER_ID_COLUMN = {
    AuthProvider.google: User.google_sub,
    AuthProvider.github: User.github_id,
}


class EmailNotVerifiedError(Exception):
    """An OAuth email collides with an existing account, but the provider
    hasn't verified it. We won't silently link the two accounts on that
    basis."""


async def _resolve_or_create_user(
    db: AsyncSession,
    *,
    provider: AuthProvider,
    provider_id: str,
    email: str,
    email_verified: bool,
    name: str | None,
) -> User:
    """Log in, link, or create a user for an OAuth profile.

    - A known provider id logs straight in.
    - An unknown provider id matching an existing, provider-verified email
      links onto that account instead of creating a duplicate.
    - Otherwise this is a first-time signup: create the user and an
      organization named after them.
    """
    id_column = _PROVIDER_ID_COLUMN[provider]

    result = await db.execute(select(User).where(id_column == provider_id))
    user = result.scalar_one_or_none()
    if user is not None:
        return user

    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing is not None:
        if not email_verified:
            raise EmailNotVerifiedError(email)
        setattr(existing, id_column.key, provider_id)
        await db.commit()
        await db.refresh(existing)
        return existing

    display_name = name or email.split("@")[0]
    organization = Organization(name=f"{display_name}'s Team", slug=slugify(display_name))
    user = User(
        email=email,
        name=name,
        auth_provider=provider,
        email_verified=email_verified,
        role=UserRole.owner,
        organization=organization,
    )
    setattr(user, id_column.key, provider_id)
    db.add(organization)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def resolve_or_create_user(db: AsyncSession, profile: GoogleProfile) -> User:
    return await _resolve_or_create_user(
        db,
        provider=AuthProvider.google,
        provider_id=profile.sub,
        email=profile.email,
        email_verified=profile.email_verified,
        name=profile.name,
    )


async def resolve_or_create_github_user(db: AsyncSession, profile: GithubProfile) -> User:
    return await _resolve_or_create_user(
        db,
        provider=AuthProvider.github,
        provider_id=profile.id,
        email=profile.email,
        email_verified=profile.email_verified,
        name=profile.name,
    )
