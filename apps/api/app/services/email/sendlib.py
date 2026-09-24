"""Sendlib (sendlib.samueltuoyo.com): sends the signup OTP through its
built-in "otp" template, which takes `name` and `code`.
"""
import httpx

from app.core.config import get_settings

SEND_URL = "https://sendlib.samueltuoyo.com/api/send"


async def send_otp_email(*, to: str, name: str, code: str) -> None:
    settings = get_settings()
    payload: dict = {"to": to, "template": "otp", "data": {"name": name, "code": code}}
    if settings.sendlib_from_email:
        payload["from"] = settings.sendlib_from_email

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            SEND_URL,
            headers={"Authorization": f"Bearer {settings.sendlib_api_key}"},
            json=payload,
        )
        response.raise_for_status()
