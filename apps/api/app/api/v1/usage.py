"""Dashboard endpoints for request logs and usage. Authenticated with the dashboard session."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.api_key import ApiKeyEnvironment
from app.models.user import User
from app.schemas.usage import LogOut, LogPage, LogStatus, UsageOut, UsageRange
from app.services import usage as usage_service

router = APIRouter(tags=["usage"])


@router.get("/logs", response_model=LogPage)
async def list_logs(
    limit: int = Query(50, ge=1, le=100),
    before: str | None = Query(None, description="`next_cursor` from the previous page."),
    status_filter: LogStatus | None = Query(None, alias="status"),
    environment: ApiKeyEnvironment | None = None,
    api_key_id: uuid.UUID | None = None,
    method: str | None = Query(None, max_length=10),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LogPage:
    """Public API requests made with this organization's keys, newest first."""
    return await usage_service.list_logs(
        db,
        user.organization_id,
        limit=limit,
        before=before,
        status=status_filter,
        environment=environment,
        api_key_id=api_key_id,
        method=method,
    )


@router.get("/logs/{log_id}", response_model=LogOut)
async def get_log(
    log_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LogOut:
    try:
        return await usage_service.get_log(db, user.organization_id, log_id)
    except usage_service.LogNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Log not found.") from exc


@router.get("/usage", response_model=UsageOut)
async def get_usage(
    range_: UsageRange = Query("7d", alias="range"),
    environment: ApiKeyEnvironment | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UsageOut:
    """Request and assessment counts for the last 7, 30, or 90 days (UTC)."""
    return await usage_service.usage(
        db, user.organization_id, range_=range_, environment=environment
    )
