import httpx

from app.core.config import get_settings
from app.services.auth.otp import OTP_TTL_SECONDS
from app.services.email.templates import (
    OTP_SUBJECT,
    WELCOME_SUBJECT,
    render_otp_email,
    render_welcome_email,
)

SEND_URL = "https://sendlib.samueltuoyo.com/api/send"


async def _send(*, to: str, subject: str, html: str, text: str) -> None:
    settings = get_settings()
    payload: dict = {"to": to, "subject": subject, "html": html, "text": text}
    if settings.sendlib_from_email:
        payload["from"] = settings.sendlib_from_email

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            SEND_URL,
            headers={"Authorization": f"Bearer {settings.sendlib_api_key}"},
            json=payload,
        )
        response.raise_for_status()


async def send_otp_email(*, to: str, name: str, code: str) -> None:
    html, text = render_otp_email(name=name, code=code, expires_minutes=OTP_TTL_SECONDS // 60)
    await _send(to=to, subject=OTP_SUBJECT, html=html, text=text)


async def send_welcome_email(*, to: str, name: str, organization: str) -> None:
    html, text = render_welcome_email(name=name, organization=organization)
    await _send(to=to, subject=WELCOME_SUBJECT, html=html, text=text)
