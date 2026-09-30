"""API key generation and verification.

Format: ``sk_<env>_<public>_<secret>``, e.g. ``sk_live_4f9a2c1e_Xb3...``.

- ``prefix`` = ``sk_<env>_<public>`` is stored in plain text and indexed, so a
  request can find its key row with one lookup instead of hashing against
  every key.
- The whole key is hashed with SHA-256. Keys carry ~190 bits of randomness, so
  a fast hash is appropriate here (unlike passwords, which use bcrypt).
- Verification compares hashes in constant time.
"""
import hashlib
import hmac
import secrets
from dataclasses import dataclass

from app.models.api_key import ApiKeyEnvironment

_PUBLIC_BYTES = 4  # 8 hex chars
_SECRET_BYTES = 24  # 32 url-safe chars


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
    return "_".join(parts[:3])


def matches(key: str, key_hash: str) -> bool:
    return hmac.compare_digest(hash_key(key), key_hash)


def mask(environment: ApiKeyEnvironment, last_four: str) -> str:
    return f"sk_{environment.value}_••••••{last_four}"
