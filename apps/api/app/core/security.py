"""JWT issuing and verification.

Two token types: a short-lived access token (used as a bearer token on API
requests) and a longer-lived refresh token (`JWT_EXPIRES_IN` in `.env`, e.g.
"7d"). Both are HS256, signed with `JWT_SECRET`.
"""
import re
import time
from datetime import timedelta

import bcrypt
import jwt

from app.core.config import get_settings

ACCESS_TOKEN_TTL = timedelta(minutes=15)

_DURATION_RE = re.compile(r"^(\d+)([smhd])$")
_UNIT_TO_KWARG = {"s": "seconds", "m": "minutes", "h": "hours", "d": "days"}


def parse_duration(value: str) -> timedelta:
    """Parse a short duration string like "15m", "12h", or "7d"."""
    match = _DURATION_RE.fullmatch(value.strip())
    if not match:
        raise ValueError(f"Unrecognized duration: {value!r}")
    amount, unit = match.groups()
    return timedelta(**{_UNIT_TO_KWARG[unit]: int(amount)})


def _encode(subject: str, token_type: str, ttl: timedelta, extra_claims: dict | None = None) -> str:
    settings = get_settings()
    now = int(time.time())
    payload: dict = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + int(ttl.total_seconds()),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_access_token(user_id: str, organization_id: str) -> str:
    return _encode(user_id, "access", ACCESS_TOKEN_TTL, {"org": organization_id})


def create_refresh_token(user_id: str) -> str:
    settings = get_settings()
    return _encode(user_id, "refresh", parse_duration(settings.jwt_expires_in))


def decode_token(token: str) -> dict:
    """Decode and verify a token. Raises `jwt.PyJWTError` if invalid or expired."""
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())
