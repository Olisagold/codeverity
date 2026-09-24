import re
import secrets


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return f"{slug or 'org'}-{secrets.token_hex(3)}"
