"""Request logs and usage stats for the dashboard. Everything is scoped to one organization."""

import uuid
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import Date, cast, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import ApiKey, ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from app.models.request_log import RequestLog
from app.schemas.usage import (
    KeyRef,
    KeyUsage,
    LogOut,
    LogPage,
    LogStatus,
    UsageOut,
    UsagePoint,
    UsageRange,
    UsageTotals,
)

RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90}


class LogNotFound(Exception):
    pass


def _key_ref(key_id: uuid.UUID | None, name: str | None) -> KeyRef | None:
    return KeyRef(id=key_id, name=name) if key_id and name else None


def _log_out(entry: RequestLog, key_name: str | None) -> LogOut:
    return LogOut(
        id=entry.public_id,
        method=entry.method,
        path=entry.path,
        status=entry.status_code,
        duration_ms=entry.duration_ms,
        environment=entry.environment,
        api_key=_key_ref(entry.api_key_id, key_name),
        created_at=entry.created_at,
    )


def _logs_query(organization_id: uuid.UUID):
    return (
        select(RequestLog, ApiKey.name)
        .outerjoin(ApiKey, ApiKey.id == RequestLog.api_key_id)
        .where(RequestLog.organization_id == organization_id)
    )


async def list_logs(
    db: AsyncSession,
    organization_id: uuid.UUID,
    *,
    limit: int,
    before: str | None = None,
    status: LogStatus | None = None,
    environment: ApiKeyEnvironment | None = None,
    api_key_id: uuid.UUID | None = None,
) -> LogPage:
    query = _logs_query(organization_id)
    # Public IDs are ULIDs, so they sort by creation time.
    if before:
        query = query.where(RequestLog.public_id < before)
    if status == "success":
        query = query.where(RequestLog.status_code < 400)
    elif status == "error":
        query = query.where(RequestLog.status_code >= 400)
    if environment:
        query = query.where(RequestLog.environment == environment)
    if api_key_id:
        query = query.where(RequestLog.api_key_id == api_key_id)

    rows = (await db.execute(query.order_by(RequestLog.public_id.desc()).limit(limit + 1))).all()
    page = [_log_out(entry, name) for entry, name in rows[:limit]]
    return LogPage(data=page, next_cursor=page[-1].id if len(rows) > limit else None)


async def get_log(db: AsyncSession, organization_id: uuid.UUID, public_id: str) -> LogOut:
    row = (
        await db.execute(_logs_query(organization_id).where(RequestLog.public_id == public_id))
    ).first()
    if row is None:
        raise LogNotFound
    return _log_out(*row)


async def usage(
    db: AsyncSession,
    organization_id: uuid.UUID,
    *,
    range_: UsageRange,
    environment: ApiKeyEnvironment | None = None,
) -> UsageOut:
    days = RANGE_DAYS[range_]
    today = datetime.now(UTC).date()
    first_day = today - timedelta(days=days - 1)
    since = datetime.combine(first_day, datetime.min.time(), tzinfo=UTC)

    def _scoped(model, query):
        query = query.where(model.organization_id == organization_id, model.created_at >= since)
        return query.where(model.environment == environment) if environment else query

    def _day(model):
        return cast(func.timezone("UTC", model.created_at), Date)

    request_days = await db.execute(
        _scoped(RequestLog, select(_day(RequestLog), func.count())).group_by(_day(RequestLog))
    )
    assessment_days = await db.execute(
        _scoped(Assessment, select(_day(Assessment), func.count())).group_by(_day(Assessment))
    )
    statuses = await db.execute(
        _scoped(Assessment, select(Assessment.status, func.count())).group_by(Assessment.status)
    )
    keys = await db.execute(
        _scoped(
            RequestLog,
            select(RequestLog.api_key_id, ApiKey.name, func.count()).outerjoin(
                ApiKey, ApiKey.id == RequestLog.api_key_id
            ),
        )
        .group_by(RequestLog.api_key_id, ApiKey.name)
        .order_by(func.count().desc())
    )

    requests_by_day: dict[date, int] = dict(request_days.all())
    assessments_by_day: dict[date, int] = dict(assessment_days.all())
    by_status: dict[AssessmentStatus, int] = dict(statuses.all())
    series = [
        UsagePoint(
            date=day,
            requests=requests_by_day.get(day, 0),
            assessments=assessments_by_day.get(day, 0),
        )
        for day in (first_day + timedelta(days=i) for i in range(days))
    ]
    return UsageOut(
        range=range_,
        environment=environment,
        totals=UsageTotals(
            requests=sum(requests_by_day.values()),
            assessments=sum(by_status.values()),
            completed=by_status.get(AssessmentStatus.completed, 0),
            failed=by_status.get(AssessmentStatus.failed, 0),
        ),
        series=series,
        by_key=[
            KeyUsage(api_key=_key_ref(key_id, name), requests=count)
            for key_id, name, count in keys.all()
        ],
    )


async def prune_logs(db: AsyncSession, retention_days: int) -> int:
    cutoff = datetime.now(UTC) - timedelta(days=retention_days)
    result = await db.execute(delete(RequestLog).where(RequestLog.created_at < cutoff))
    await db.commit()
    return result.rowcount or 0
