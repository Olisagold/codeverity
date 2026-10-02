"""Signed-out tokens. A token's `jti` is kept in Redis until the token would
have expired anyway, so the denylist never grows past live tokens.
"""

import logging
import time

from redis.exceptions import RedisError

from app.db.redis import get_redis

REVOKED_PREFIX = "auth:revoked:"

log = logging.getLogger("codeverity.auth")


async def revoke(payload: dict) -> None:
    jti, exp = payload.get("jti"), payload.get("exp")
    if not jti or not exp:
        return
    ttl = int(exp - time.time())
    if ttl > 0:
        await get_redis().set(f"{REVOKED_PREFIX}{jti}", 1, ex=ttl)


async def is_revoked(payload: dict) -> bool:
    """Tokens issued before `jti` existed have none and can't be revoked.

    If Redis is down the token is accepted: access tokens last 15 minutes, and
    refusing every session during an outage would be worse.
    """
    jti = payload.get("jti")
    if not jti:
        return False
    try:
        return bool(await get_redis().exists(f"{REVOKED_PREFIX}{jti}"))
    except RedisError:
        log.warning("revocation check skipped: Redis unavailable", exc_info=True)
        return False
