"""Rate limits for the public API, counted in Redis fixed windows.

- Every request: `RATE_LIMIT_REQUESTS_PER_MINUTE` per API key.
- New assessments: `RATE_LIMIT_ASSESSMENTS_PER_MINUTE` per API key, and
  `LIVE_ASSESSMENTS_PER_DAY` per organization for live keys. The daily cap
  protects model credit. Test keys don't call the models, so they skip it.

A limit of 0 turns that check off. If Redis is down, requests are let through
rather than taking the API down with it.
"""

import logging
import time
from datetime import UTC, datetime

from fastapi import Depends, HTTPException, Response, status
from redis.exceptions import RedisError

from app.api.deps import ApiCaller, get_api_caller
from app.core.config import get_settings
from app.db.redis import get_redis

log = logging.getLogger("codeverity.rate_limit")

MINUTE = 60
DAY = 86_400


async def _count(key: str, ttl: int) -> int | None:
    """Increment a window counter. Returns None if Redis is unavailable."""
    try:
        async with get_redis().pipeline(transaction=True) as pipe:
            pipe.incr(key)
            pipe.expire(key, ttl, nx=True)
            count, _ = await pipe.execute()
        return count
    except RedisError:
        log.warning("rate limit check skipped: Redis unavailable", exc_info=True)
        return None


def _too_many(detail: str, limit: int, retry_after: int) -> HTTPException:
    return HTTPException(
        status.HTTP_429_TOO_MANY_REQUESTS,
        detail,
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": "0",
        },
    )


async def _per_minute(name: str, caller: ApiCaller, limit: int) -> tuple[int, int] | None:
    """Count a hit in this minute's window. Returns (remaining, seconds to reset)."""
    if limit <= 0:
        return None
    now = int(time.time())
    count = await _count(f"rl:{name}:{caller.api_key.id}:{now // MINUTE}", MINUTE)
    if count is None:
        return None
    reset = MINUTE - now % MINUTE
    if count > limit:
        raise _too_many("Rate limit exceeded. Slow down and retry later.", limit, reset)
    return limit - count, reset


async def limit_requests(
    response: Response, caller: ApiCaller = Depends(get_api_caller)
) -> ApiCaller:
    """Router dependency: counts every public API request against the key."""
    limit = get_settings().rate_limit_requests_per_minute
    window = await _per_minute("req", caller, limit)
    if window is not None:
        remaining, reset = window
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
    return caller


async def check_assessment_quota(caller: ApiCaller) -> None:
    """Called after the request body is validated, so rejected bodies don't use quota."""
    settings = get_settings()
    await _per_minute("asm", caller, settings.rate_limit_assessments_per_minute)

    daily = settings.live_assessments_per_day
    if not caller.is_live or daily <= 0:
        return
    today = datetime.now(UTC)
    count = await _count(f"rl:live:{caller.organization_id}:{today:%Y%m%d}", 2 * DAY)
    if count is not None and count > daily:
        seconds_left = DAY - (today.hour * 3600 + today.minute * 60 + today.second)
        raise _too_many(
            f"Your organization has reached its limit of {daily} live assessments today. "
            "It resets at 00:00 UTC.",
            daily,
            seconds_left,
        )
