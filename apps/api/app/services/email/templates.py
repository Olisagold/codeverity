from html import escape
from pathlib import Path
from string import Template

OTP_SUBJECT = "Your Codeverity verification code"

_OTP_TEMPLATE = Template((Path(__file__).parent / "html" / "otp.html").read_text())

_DIGIT_CELL = (
    '<td align="center" width="44" height="56" bgcolor="#0A0A0A" '
    'style="border:1px solid #27272A;border-radius:10px;'
    "font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;"
    'font-size:26px;font-weight:600;color:#FFFFFF;">{}</td><td width="8"></td>'
)


def render_otp_email(*, name: str, code: str, expires_minutes: int) -> tuple[str, str]:
    html = _OTP_TEMPLATE.substitute(
        subject=OTP_SUBJECT,
        name=escape(name),
        code=code,
        digits="".join(_DIGIT_CELL.format(digit) for digit in code),
        expires_minutes=expires_minutes,
    )
    text = (
        f"Hi {name},\n\n"
        f"Your Codeverity verification code is {code}.\n\n"
        f"It expires in {expires_minutes} minutes and works once. Never share it with anyone.\n\n"
        "If you did not try to create a Codeverity account, you can ignore this email."
    )
    return html, text
