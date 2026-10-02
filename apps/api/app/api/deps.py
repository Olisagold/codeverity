"""Shared FastAPI dependencies.

- ``get_db``: request-scoped database session.
- ``get_current_user``: resolves the dashboard user from a session access
  token (``Authorization: Bearer <jwt>``). Used by dashboard routes such as
  API key management.
- ``get_api_caller``: resolves the organization calling the public API from an
  API key (``Authorization: Bearer sk_live_...``). Used by public endpoints
  such as assessments.
"""

import uuid
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.api_key import ApiKey, ApiKeyEnvironment
from app.models.user import User
from app.services import api_keys as key_service
from app.services.auth import revocation

_bearer = HTTPBearer(auto_error=False)

_UNAUTHORIZED = HTTPException(
    status.HTTP_401_UNAUTHORIZED,
    "Not authenticated.",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise _UNAUTHORIZED
    try:
        payload = decode_token(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise _UNAUTHORIZED from exc
    if payload.get("type") != "access" or await revocation.is_revoked(payload):
        raise _UNAUTHORIZED

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise _UNAUTHORIZED from exc

    user = await db.get(User, user_id)
    if user is None:
        raise _UNAUTHORIZED
    return user


@dataclass(frozen=True)
class ApiCaller:
    """Who is calling the public API: the key used and the organization it belongs to."""

    api_key: ApiKey

    @property
    def organization_id(self) -> uuid.UUID:
        return self.api_key.organization_id

    @property
    def environment(self) -> ApiKeyEnvironment:
        return self.api_key.environment

    @property
    def is_live(self) -> bool:
        return self.api_key.environment == ApiKeyEnvironment.live


def _api_key_error(detail: str) -> HTTPException:
    return HTTPException(
        status.HTTP_401_UNAUTHORIZED, detail, headers={"WWW-Authenticate": "Bearer"}
    )


async def get_api_caller(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> ApiCaller:
    if credentials is None:
        raise _api_key_error("Missing API key. Send it as 'Authorization: Bearer sk_...'.")
    api_key = await key_service.authenticate(db, credentials.credentials)
    if api_key is None:
        raise _api_key_error("Invalid API key.")
    # Read by RequestLogMiddleware to attribute the request.
    request.state.api_key = api_key
    return ApiCaller(api_key=api_key)


__all__ = ["ApiCaller", "get_api_caller", "get_current_user", "get_db"]
