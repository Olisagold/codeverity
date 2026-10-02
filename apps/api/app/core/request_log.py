"""ASGI middleware that logs public API requests made with a recognized API key.

`get_api_caller` puts the key on `request.state`; requests without one (no
key, unknown key, dashboard routes) are not logged because no organization
could see them. Every /v1 response gets an `X-Request-Id` header, which
matches the log's ID when the request is logged.
"""

import logging
import time

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.ids import new_id
from app.db.session import SessionLocal
from app.models.request_log import RequestLog

log = logging.getLogger("codeverity.request_log")


class RequestLogMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not scope["path"].startswith("/v1/"):
            await self.app(scope, receive, send)
            return

        request_id = new_id("req")
        state = scope.setdefault("state", {})
        started = time.monotonic()
        status_code = 500

        async def send_with_id(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                message.setdefault("headers", []).append((b"x-request-id", request_id.encode()))
            await send(message)

        try:
            await self.app(scope, receive, send_with_id)
        finally:
            api_key = state.get("api_key")
            if api_key is not None:
                await _record(
                    RequestLog(
                        public_id=request_id,
                        organization_id=api_key.organization_id,
                        api_key_id=api_key.id,
                        environment=api_key.environment,
                        method=scope["method"],
                        path=scope["path"][:500],
                        status_code=status_code,
                        duration_ms=round((time.monotonic() - started) * 1000),
                    )
                )


async def _record(entry: RequestLog) -> None:
    """Best effort: a logging failure never fails the request."""
    try:
        async with SessionLocal() as db:
            db.add(entry)
            await db.commit()
    except Exception:
        log.exception("could not record request log")
