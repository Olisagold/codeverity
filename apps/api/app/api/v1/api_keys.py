"""Dashboard endpoints for managing an organization's API keys.

Authenticated with the dashboard session (JWT access token). Every query is
scoped to the caller's organization, so one organization can never see or
revoke another's keys.
"""
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.api_key import ApiKey
from app.models.user import User
from app.schemas.api_keys import ApiKeyCreate, ApiKeyCreated, ApiKeyOut
from app.services import api_keys as keys

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

MAX_ACTIVE_KEYS = 25


def _to_out(api_key: ApiKey) -> ApiKeyOut:
    return ApiKeyOut(
        id=api_key.id,
        name=api_key.name,
        description=api_key.description,
        environment=api_key.environment,
        masked=keys.mask(api_key.environment, api_key.last_four),
        active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


async def _get_owned_key(db: AsyncSession, key_id: uuid.UUID, user: User) -> ApiKey:
    api_key = await db.get(ApiKey, key_id)
    if api_key is None or api_key.organization_id != user.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found.")
    return api_key


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[ApiKeyOut]:
    """Active keys for the caller's organization, newest first."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.organization_id == user.organization_id, ApiKey.revoked_at.is_(None))
        .order_by(ApiKey.created_at.desc())
    )
    return [_to_out(api_key) for api_key in result.scalars()]


@router.post("", response_model=ApiKeyCreated, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    body: ApiKeyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiKeyCreated:
    """Create a key. The full secret is in the response and is never retrievable again."""
    active = await db.execute(
        select(ApiKey.id).where(
            ApiKey.organization_id == user.organization_id, ApiKey.revoked_at.is_(None)
        )
    )
    if len(active.all()) >= MAX_ACTIVE_KEYS:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"An organization can have at most {MAX_ACTIVE_KEYS} active API keys.",
        )

    generated = keys.generate_key(body.environment)
    description = body.description.strip() if body.description else None
    api_key = ApiKey(
        organization_id=user.organization_id,
        created_by_id=user.id,
        name=body.name.strip(),
        description=description or None,
        environment=body.environment,
        prefix=generated.prefix,
        key_hash=generated.key_hash,
        last_four=generated.last_four,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return ApiKeyCreated(**_to_out(api_key).model_dump(), key=generated.key)


@router.get("/{key_id}", response_model=ApiKeyOut)
async def get_api_key(
    key_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiKeyOut:
    return _to_out(await _get_owned_key(db, key_id, user))


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Revoke a key. Revoked keys stop authenticating immediately. Idempotent."""
    api_key = await _get_owned_key(db, key_id, user)
    if api_key.revoked_at is None:
        api_key.revoked_at = datetime.now(UTC)
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
