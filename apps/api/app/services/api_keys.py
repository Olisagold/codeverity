"""API keys: generation, storage rules, and authentication.

Format: ``sk_<env>_<public>_<secret>``, e.g. ``sk_live_4f9a2c1e_Xb3...``.

- ``prefix`` = ``sk_<env>_<public>`` is stored in plain text and indexed, so a
  request can find its key row with one lookup instead of hashing against
  every key.
- The whole key is hashed with SHA-256. Keys carry ~190 bits of randomness, so
  a fast hash is appropriate here (unlike passwords, which use bcrypt).
- Verification compares hashes in constant time.

Everything that touches the database lives here, so the dashboard routes and
the public-API auth dependency share one set of rules. Routes translate the
exceptions below into HTTP responses.
"""

import hashlib
import hmac
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import ApiKey, ApiKeyEnvironment

MAX_ACTIVE_KEYS = 25


LAST_USED_RESOLUTION = timedelta(minutes=1)

_PUBLIC_BYTES = 4  # 8 hex chars
_SECRET_BYTES = 24  # 32 url-safe chars


class ApiKeyNotFound(Exception):
    """The key doesn't exist or belongs to another organization."""


class ApiKeyLimitReached(Exception):
    """The organization already has MAX_ACTIVE_KEYS active keys."""


@dataclass(frozen=True)
class GeneratedKey:
    key: str
    prefix: str
    key_hash: str
    last_four: str


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def generate_key(environment: ApiKeyEnvironment) -> GeneratedKey:
    prefix = f"sk_{environment.value}_{secrets.token_hex(_PUBLIC_BYTES)}"
    key = f"{prefix}_{secrets.token_urlsafe(_SECRET_BYTES)}"
    return GeneratedKey(key=key, prefix=prefix, key_hash=hash_key(key), last_four=key[-4:])


def parse_prefix(key: str) -> str | None:
    """Return the lookup prefix of a well-formed key, or None."""
    parts = key.split("_", 3)
    if len(parts) != 4 or parts[0] != "sk" or parts[1] not in ApiKeyEnvironment.__members__:
        return None
    if not parts[2] or not parts[3]:
        return None
    return "_".join(parts[:3])


def matches(key: str, key_hash: str) -> bool:
    return hmac.compare_digest(hash_key(key), key_hash)


def mask(environment: ApiKeyEnvironment, last_four: str) -> str:
    return f"sk_{environment.value}_••••••{last_four}"


async def list_active(db: AsyncSession, organization_id: uuid.UUID) -> list[ApiKey]:
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.organization_id == organization_id, ApiKey.revoked_at.is_(None))
        .order_by(ApiKey.created_at.desc())
    )
    return list(result.scalars())


async def create(
    db: AsyncSession,
    *,
    organization_id: uuid.UUID,
    created_by_id: uuid.UUID | None,
    name: str,
    environment: ApiKeyEnvironment,
    description: str | None = None,
) -> tuple[ApiKey, str]:
    """Create a key and return it with the full secret. The secret is never stored."""
    active_count = await db.scalar(
        select(func.count())
        .select_from(ApiKey)
        .where(ApiKey.organization_id == organization_id, ApiKey.revoked_at.is_(None))
    )
    if (active_count or 0) >= MAX_ACTIVE_KEYS:
        raise ApiKeyLimitReached

    generated = generate_key(environment)
    api_key = ApiKey(
        organization_id=organization_id,
        created_by_id=created_by_id,
        name=name.strip(),
        description=(description or "").strip() or None,
        environment=environment,
        prefix=generated.prefix,
        key_hash=generated.key_hash,
        last_four=generated.last_four,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    return api_key, generated.key


async def get_owned(db: AsyncSession, public_id: str, organization_id: uuid.UUID) -> ApiKey:
    api_key = await db.scalar(
        select(ApiKey).where(
            ApiKey.public_id == public_id, ApiKey.organization_id == organization_id
        )
    )
    if api_key is None:
        raise ApiKeyNotFound
    return api_key


async def revoke(db: AsyncSession, api_key: ApiKey) -> None:
    """Revoke a key. Safe to call more than once."""
    if api_key.revoked_at is None:
        api_key.revoked_at = datetime.now(UTC)
        await db.commit()


async def authenticate(db: AsyncSession, raw_key: str) -> ApiKey | None:
    """Resolve an active key from its raw value, or None if it isn't valid.

    Malformed, unknown, mismatched and revoked keys all return None, so callers
    can't tell which check failed.
    """
    prefix = parse_prefix(raw_key)
    if prefix is None:
        return None

    api_key = await db.scalar(select(ApiKey).where(ApiKey.prefix == prefix))
    if api_key is None or not matches(raw_key, api_key.key_hash) or not api_key.is_active:
        return None

    await _touch_last_used(db, api_key)
    return api_key


async def _touch_last_used(db: AsyncSession, api_key: ApiKey) -> None:
    now = datetime.now(UTC)
    if api_key.last_used_at is None or now - api_key.last_used_at >= LAST_USED_RESOLUTION:
        api_key.last_used_at = now
        await db.commit()
