"""GitHub OAuth: building the consent-screen URL, and exchanging an
authorization code for the signed-in user's profile.

GitHub's `/user` endpoint doesn't reliably return an email (it's null when the
user has made their email private), so we always follow up with `/user/emails`
and pick the primary, verified one.
"""
from dataclasses import dataclass

from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.core.config import get_settings

AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
TOKEN_URL = "https://github.com/login/oauth/access_token"
USER_URL = "https://api.github.com/user"
EMAILS_URL = "https://api.github.com/user/emails"
SCOPE = "read:user user:email"

API_HEADERS = {"Accept": "application/vnd.github+json"}


@dataclass
class GithubProfile:
    id: str
    email: str
    email_verified: bool
    name: str | None


class NoVerifiedEmailError(Exception):
    """The GitHub account has no email GitHub will vouch for."""


def _client() -> AsyncOAuth2Client:
    settings = get_settings()
    return AsyncOAuth2Client(
        client_id=settings.github_client_id,
        client_secret=settings.github_client_secret,
        redirect_uri=settings.github_redirect_uri,
        scope=SCOPE,
    )


def build_authorize_url(state: str) -> str:
    url, _ = _client().create_authorization_url(AUTHORIZE_URL, state=state)
    return url


def _pick_email(emails: list[dict]) -> tuple[str, bool]:
    """Prefer the primary verified email; fall back to any verified one."""
    by_priority = sorted(emails, key=lambda e: (not e["primary"], not e["verified"]))
    for candidate in by_priority:
        if candidate["verified"]:
            return candidate["email"], True
    raise NoVerifiedEmailError


async def fetch_profile(code: str) -> GithubProfile:
    """Exchange an authorization code for the profile GitHub just verified."""
    async with _client() as client:
        await client.fetch_token(
            TOKEN_URL, code=code, grant_type="authorization_code", headers=API_HEADERS
        )
        user_response = await client.get(USER_URL, headers=API_HEADERS)
        user_response.raise_for_status()
        user = user_response.json()

        emails_response = await client.get(EMAILS_URL, headers=API_HEADERS)
        emails_response.raise_for_status()
        email, email_verified = _pick_email(emails_response.json())

    return GithubProfile(
        id=str(user["id"]),
        email=email,
        email_verified=email_verified,
        name=user.get("name") or user.get("login"),
    )
