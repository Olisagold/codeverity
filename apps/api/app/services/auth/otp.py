"""The signup email-verification code: generation, Redis storage, and
attempt-limited verification.
"""
import secrets

from app.db.redis import get_redis

OTP_PREFIX = "otp:code:"
OTP_ATTEMPTS_PREFIX = "otp:attempts:"
OTP_TTL_SECONDS = 600
MAX_ATTEMPTS = 5


def generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def store_code(email: str, code: str) -> None:
    redis = get_redis()
    await redis.set(f"{OTP_PREFIX}{email}", code, ex=OTP_TTL_SECONDS)
    await redis.delete(f"{OTP_ATTEMPTS_PREFIX}{email}")


async def verify_code(email: str, code: str) -> bool:
    redis = get_redis()
    code_key = f"{OTP_PREFIX}{email}"
    attempts_key = f"{OTP_ATTEMPTS_PREFIX}{email}"

    stored = await redis.get(code_key)
    if stored is None:
        return False

    attempts = await redis.incr(attempts_key)
    await redis.expire(attempts_key, OTP_TTL_SECONDS)
    if attempts > MAX_ATTEMPTS or stored.decode() != code:
        if attempts > MAX_ATTEMPTS:
            await redis.delete(code_key)
        return False

    await redis.delete(code_key)
    await redis.delete(attempts_key)
    return True
