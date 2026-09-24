from html import escape
from pathlib import Path
from string import Template

from app.core.config import get_settings

OTP_SUBJECT = "Your Codeverity verification code"

_OTP_TEMPLATE = Template((Path(__file__).parent / "html" / "otp.html").read_text())

_DIGIT_CELL = (
    '<td align="center" width="44" height="56" bgcolor="#FFFFFF" '
    'style="border:1px solid #E4E4E7;border-radius:10px;'
    "font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;"
    'font-size:26px;font-weight:600;color:#09090B;">{}</td>'
)
_DIGIT_GAP = '<td width="8"></td>'


def render_otp_email(*, name: str, code: str, expires_minutes: int) -> tuple[str, str]:
    settings = get_settings()
    html = _OTP_TEMPLATE.substitute(
        subject=OTP_SUBJECT,
        name=escape(name),
        code=code,
        digits=_DIGIT_GAP.join(_DIGIT_CELL.format(digit) for digit in code),
        expires_minutes=expires_minutes,
        app_url=settings.frontend_url.rstrip("/"),
    )
    text = (
        f"Hi {name},\n\n"
        "You're almost set to start using Codeverity. "
        f"Your verification code is {code}.\n\n"
        f"It expires in {expires_minutes} minutes. Never share this code.\n\n"
        "If you did not try to create a Codeverity account, you can ignore this email."
    )
    return html, text
