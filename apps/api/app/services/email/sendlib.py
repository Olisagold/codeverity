import httpx

from app.core.config import get_settings
from app.services.auth.otp import OTP_TTL_SECONDS
from app.services.email.templates import OTP_SUBJECT, render_otp_email

SEND_URL = "https://sendlib.samueltuoyo.com/api/send"


async def send_otp_email(*, to: str, name: str, code: str) -> None:
    settings = get_settings()
    html, text = render_otp_email(name=name, code=code, expires_minutes=OTP_TTL_SECONDS // 60)
    payload: dict = {"to": to, "subject": OTP_SUBJECT, "html": html, "text": text}
    if settings.sendlib_from_email:
        payload["from"] = settings.sendlib_from_email

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            SEND_URL,
            headers={"Authorization": f"Bearer {settings.sendlib_api_key}"},
            json=payload,
        )
        response.raise_for_status()
