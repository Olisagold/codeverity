"""Public, prefixed, time-sortable IDs like ``asm_01J9Z3K4X8QH7N2V5T6B0C1D2E``.

The suffix is a ULID: 48 bits of millisecond timestamp plus 80 random bits,
Crockford base32 encoded to 26 characters. IDs sort by creation time and are
safe to expose, unlike sequential integers.
"""

import secrets
import time

_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def ulid() -> str:
    value = (int(time.time() * 1000) << 80) | secrets.randbits(80)
    chars = []
    for _ in range(26):
        chars.append(_ALPHABET[value & 31])
        value >>= 5
    return "".join(reversed(chars))


def new_id(prefix: str) -> str:
    return f"{prefix}_{ulid()}"
