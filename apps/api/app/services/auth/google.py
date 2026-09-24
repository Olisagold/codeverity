"""Google OAuth: building the consent-screen URL, and exchanging an
authorization code for the signed-in user's profile.
"""
from dataclasses import dataclass

from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.core.config import get_settings

AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
SCOPE = "openid email profile"


@dataclass
class GoogleProfile:
    sub: str
    email: str
    email_verified: bool
    name: str | None


def _client() -> AsyncOAuth2Client:
    settings = get_settings()
    return AsyncOAuth2Client(
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        redirect_uri=settings.google_redirect_uri,
        scope=SCOPE,
    )


def build_authorize_url(state: str) -> str:
    url, _ = _client().create_authorization_url(AUTHORIZE_URL, state=state)
    return url


async def fetch_profile(code: str) -> GoogleProfile:
    """Exchange an authorization code for the profile Google just verified."""
    async with _client() as client:
        await client.fetch_token(TOKEN_URL, code=code, grant_type="authorization_code")
        response = await client.get(USERINFO_URL)
        response.raise_for_status()
        data = response.json()

    return GoogleProfile(
        sub=data["sub"],
        email=data["email"],
        email_verified=bool(data.get("email_verified", False)),
        name=data.get("name"),
    )
