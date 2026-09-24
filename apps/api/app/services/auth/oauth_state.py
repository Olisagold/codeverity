"""Short-lived values the OAuth redirect dance needs to pass between requests,
held in Redis since nothing here is worth a database row.

Two uses:
- `state`: a CSRF token round-tripped through Google, so the callback can tell
  the login request actually came from us.
- an exchange code: swapped by the frontend for the real JWTs, so the tokens
  themselves never appear in a URL or browser history.
"""
import secrets

from app.db.redis import get_redis

STATE_PREFIX = "oauth:state:"
STATE_TTL_SECONDS = 300

EXCHANGE_PREFIX = "oauth:exchange:"
EXCHANGE_TTL_SECONDS = 60


async def create_state() -> str:
    state = secrets.token_urlsafe(24)
    await get_redis().set(f"{STATE_PREFIX}{state}", "1", ex=STATE_TTL_SECONDS)
    return state


async def consume_state(state: str) -> bool:
    """Returns True once, for a state that was actually issued. False otherwise."""
    deleted = await get_redis().delete(f"{STATE_PREFIX}{state}")
    return deleted == 1


async def create_exchange_code(payload: str) -> str:
    code = secrets.token_urlsafe(24)
    await get_redis().set(f"{EXCHANGE_PREFIX}{code}", payload, ex=EXCHANGE_TTL_SECONDS)
    return code


async def consume_exchange_code(code: str) -> str | None:
    """Returns the stored payload once, then deletes it. None if unknown or expired."""
    redis = get_redis()
    key = f"{EXCHANGE_PREFIX}{code}"
    async with redis.pipeline(transaction=True) as pipe:
        value, _ = await pipe.get(key).delete(key).execute()
    return value.decode() if value else None
