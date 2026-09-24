from html import escape
from pathlib import Path
from string import Template

from app.core.config import get_settings

OTP_SUBJECT = "Your Codeverity verification code"
WELCOME_SUBJECT = "Welcome to Codeverity"

_HTML_DIR = Path(__file__).parent / "html"
_BASE = Template((_HTML_DIR / "base.html").read_text())
_OTP = Template((_HTML_DIR / "otp.html").read_text())
_WELCOME = Template((_HTML_DIR / "welcome.html").read_text())

_DIGIT_CELL = (
    '<td align="center" width="44" height="56" bgcolor="#FFFFFF" '
    'style="border:1px solid #E4E4E7;border-radius:10px;'
    "font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;"
    'font-size:26px;font-weight:600;color:#09090B;">{}</td>'
)
_DIGIT_GAP = '<td width="8"></td>'


def _app_url() -> str:
    return get_settings().frontend_url.rstrip("/")


def _layout(*, subject: str, preview: str, body: str, footer_note: str) -> str:
    settings = get_settings()
    return _BASE.substitute(
        subject=subject,
        preview=preview,
        body=body,
        footer_note=footer_note,
        app_url=_app_url(),
        assets_url=settings.email_assets_url.rstrip("/"),
        instagram_url=settings.instagram_url,
        x_url=settings.x_url,
        linkedin_url=settings.linkedin_url,
    )


def render_otp_email(*, name: str, code: str, expires_minutes: int) -> tuple[str, str]:
    body = _OTP.substitute(
        name=escape(name),
        digits=_DIGIT_GAP.join(_DIGIT_CELL.format(digit) for digit in code),
        expires_minutes=expires_minutes,
    )
    html = _layout(
        subject=OTP_SUBJECT,
        preview=f"Your code is {code}. It expires in {expires_minutes} minutes.",
        body=body,
        footer_note="If you did not try to create a Codeverity account, you can ignore this email.",
    )
    text = (
        f"Hi {name},\n\n"
        "You're almost set to start using Codeverity. "
        f"Your verification code is {code}.\n\n"
        f"It expires in {expires_minutes} minutes. Never share this code.\n\n"
        "If you did not try to create a Codeverity account, you can ignore this email."
    )
    return html, text


def render_welcome_email(*, name: str, organization: str) -> tuple[str, str]:
    app_url = _app_url()
    body = _WELCOME.substitute(
        name=escape(name), organization=escape(organization), app_url=app_url
    )
    html = _layout(
        subject=WELCOME_SUBJECT,
        preview="Your account is ready. Here is how to run your first assessment.",
        body=body,
        footer_note="You're receiving this because you created a Codeverity account.",
    )
    text = (
        f"Hi {name},\n\n"
        f"Your email is verified and {organization} is ready.\n\n"
        "1. Create an API key from the dashboard.\n"
        "2. Send your first submission to /v1/assessments.\n"
        "3. Add a webhook to get notified when results are ready.\n\n"
        f"Dashboard: {app_url}/dashboard\n"
        f"Quickstart: {app_url}/docs/quickstart"
    )
    return html, text
