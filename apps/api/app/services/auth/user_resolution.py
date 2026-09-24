"""Turning a verified Google profile into a `User` row."""
import re
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.user import AuthProvider, User, UserRole
from app.services.auth.google import GoogleProfile


class EmailNotVerifiedError(Exception):
    """A Google email collides with an existing account, but Google hasn't
    verified it. We won't silently link the two accounts on that basis."""


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return f"{slug or 'org'}-{secrets.token_hex(3)}"


async def resolve_or_create_user(db: AsyncSession, profile: GoogleProfile) -> User:
    """Log in, link, or create a user for a Google profile.

    - A known `google_sub` logs straight in.
    - An unknown `google_sub` matching an existing, Google-verified email links
      onto that account instead of creating a duplicate.
    - Otherwise this is a first-time signup: create the user and an
      organization named after them.
    """
    result = await db.execute(select(User).where(User.google_sub == profile.sub))
    user = result.scalar_one_or_none()
    if user is not None:
        return user

    result = await db.execute(select(User).where(User.email == profile.email))
    existing = result.scalar_one_or_none()
    if existing is not None:
        if not profile.email_verified:
            raise EmailNotVerifiedError(profile.email)
        existing.google_sub = profile.sub
        await db.commit()
        await db.refresh(existing)
        return existing

    display_name = profile.name or profile.email.split("@")[0]
    organization = Organization(name=f"{display_name}'s Team", slug=_slugify(display_name))
    user = User(
        email=profile.email,
        name=profile.name,
        auth_provider=AuthProvider.google,
        google_sub=profile.sub,
        email_verified=profile.email_verified,
        role=UserRole.owner,
        organization=organization,
    )
    db.add(organization)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
