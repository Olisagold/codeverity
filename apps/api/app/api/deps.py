"""Shared FastAPI dependencies.

- ``get_db``: request-scoped database session.
- ``get_current_user``: resolves the dashboard user from a session access
  token (``Authorization: Bearer <jwt>``). Used by dashboard routes such as
  API key management. The public API authenticates with API keys instead.
"""
import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User

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
    if payload.get("type") != "access":
        raise _UNAUTHORIZED

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise _UNAUTHORIZED from exc

    user = await db.get(User, user_id)
    if user is None:
        raise _UNAUTHORIZED
    return user


__all__ = ["get_current_user", "get_db"]
