"""Password reset links: a random, single-use token emailed to the account
holder, kept in Redis so nothing lands in the database.

Only a SHA-256 hash of the token is stored, so a leaked Redis dump can't be
replayed as a reset link. Requesting a new link revokes the previous one for
that email, so at most one link per account is live at a time.
"""
import hashlib
import secrets

from app.db.redis import get_redis

TOKEN_PREFIX = "pwreset:token:"
LATEST_PREFIX = "pwreset:latest:"
RESET_TTL_SECONDS = 1800


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def create_token(email: str) -> str:
    """Issue a fresh reset token for `email`, revoking any earlier one."""
    redis = get_redis()
    latest_key = f"{LATEST_PREFIX}{email}"

    previous = await redis.get(latest_key)
    if previous is not None:
        await redis.delete(f"{TOKEN_PREFIX}{previous.decode()}")

    token = secrets.token_urlsafe(32)
    digest = _hash(token)
    await redis.set(f"{TOKEN_PREFIX}{digest}", email, ex=RESET_TTL_SECONDS)
    await redis.set(latest_key, digest, ex=RESET_TTL_SECONDS)
    return token


async def consume_token(token: str) -> str | None:
    """Return the email the token was issued for, exactly once. None if the
    token is unknown, expired, or already used.
    """
    redis = get_redis()
    key = f"{TOKEN_PREFIX}{_hash(token)}"
    async with redis.pipeline(transaction=True) as pipe:
        value, _ = await pipe.get(key).delete(key).execute()
    if not value:
        return None
    email = value.decode()
    await redis.delete(f"{LATEST_PREFIX}{email}")
    return email
