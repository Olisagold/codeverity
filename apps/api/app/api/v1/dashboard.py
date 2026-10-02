"""Dashboard endpoints authenticated with the user session.

The public assessments API uses API keys; these let the signed-in user browse
their organization's assessments across both environments.
"""

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.security import hash_password, verify_password
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from app.models.organization import Organization
from app.models.user import User
from app.schemas.dashboard import (
    AssessmentDetail,
    AssessmentPage,
    AssessmentRange,
    AssessmentSummary,
    Member,
    ModelResult,
    OrganizationUpdate,
    PasswordChange,
    QuickstartOut,
    SessionOrganization,
    SessionOut,
    SessionUser,
)
from app.services import quickstart

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90}


async def _session(db: AsyncSession, user: User) -> SessionOut:
    organization = await db.get(Organization, user.organization_id)
    members = await db.scalars(
        select(User).where(User.organization_id == organization.id).order_by(User.created_at)
    )
    return SessionOut(
        user=SessionUser(
            id=user.id,
            name=user.name,
            email=user.email,
            has_password=user.password_hash is not None,
        ),
        organization=SessionOrganization(
            id=organization.id,
            name=organization.name,
            slug=organization.slug,
            created_at=organization.created_at,
            members=[Member(name=m.name, email=m.email) for m in members],
        ),
    )


@router.get("/session", response_model=SessionOut)
async def get_session(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> SessionOut:
    """The signed-in user and their organization."""
    return await _session(db, user)


@router.patch("/organization", response_model=SessionOut)
async def update_organization(
    body: OrganizationUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SessionOut:
    organization = await db.get(Organization, user.organization_id)
    if body.name is not None:
        organization.name = body.name.strip()
    if body.slug is not None:
        organization.slug = body.slug
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "That slug is already taken.") from exc
    return await _session(db, user)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: PasswordChange,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Change the password, or set one on an account created with Google or GitHub."""
    if user.password_hash is not None and not (
        body.current_password and verify_password(body.current_password, user.password_hash)
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Your current password is incorrect.")
    user.password_hash = hash_password(body.new_password)
    await db.commit()


@router.get("/quickstart", response_model=QuickstartOut)
async def get_quickstart(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> QuickstartOut:
    """Progress through the getting started checklist on the overview page."""
    organization = await db.get(Organization, user.organization_id)
    return await quickstart.progress(db, organization)


@router.post("/quickstart/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_quickstart(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> None:
    """Hide the checklist for everyone in the organization."""
    organization = await db.get(Organization, user.organization_id)
    await quickstart.dismiss(db, organization)


def _summary(a: Assessment) -> dict:
    return {
        "id": a.public_id,
        "status": a.status,
        "environment": a.environment,
        "language": a.language,
        "title": a.assignment_title,
        "score": a.score,
        "confidence": a.confidence,
        "rubric_score": a.rubric_score,
        "created_at": a.created_at,
        "completed_at": a.completed_at,
    }


@router.get("/assessments", response_model=AssessmentPage)
async def list_assessments(
    limit: int = Query(50, ge=1, le=100),
    before: str | None = Query(None, description="`next_cursor` from the previous page."),
    status_filter: AssessmentStatus | None = Query(None, alias="status"),
    language: str | None = None,
    environment: ApiKeyEnvironment | None = None,
    range_: AssessmentRange = Query("all", alias="range"),
    q: str | None = Query(None, max_length=40, description="Assessment ID or its start."),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssessmentPage:
    query = select(Assessment).where(Assessment.organization_id == user.organization_id)
    # Public IDs are ULIDs, so they sort by creation time.
    if before:
        query = query.where(Assessment.public_id < before)
    if status_filter:
        query = query.where(Assessment.status == status_filter)
    if language:
        query = query.where(Assessment.language == language.lower())
    if environment:
        query = query.where(Assessment.environment == environment)
    if range_ != "all":
        since = datetime.now(UTC) - timedelta(days=RANGE_DAYS[range_])
        query = query.where(Assessment.created_at >= since)
    if q:
        query = query.where(Assessment.public_id.startswith(q.strip()))

    rows = list(await db.scalars(query.order_by(Assessment.public_id.desc()).limit(limit + 1)))
    page = [AssessmentSummary(**_summary(a)) for a in rows[:limit]]
    languages = await db.scalars(
        select(Assessment.language)
        .where(Assessment.organization_id == user.organization_id)
        .distinct()
        .order_by(Assessment.language)
    )
    return AssessmentPage(
        data=page,
        next_cursor=page[-1].id if len(rows) > limit else None,
        languages=list(languages),
    )


def _models(results: list | None) -> tuple[list[ModelResult], str | None]:
    models, reviewer = [], None
    for r in results or []:
        if r.get("role") == "review":
            reviewer = r.get("model")
            continue
        feedback = r.get("feedback") or {}
        models.append(
            ModelResult(
                provider=r.get("provider", "unknown"),
                model=r.get("model"),
                status=r.get("status", "failed"),
                latency_ms=r.get("latency_ms"),
                error=r.get("error"),
                summary=feedback.get("summary"),
                issues=feedback.get("issues") or [],
                suggestions=feedback.get("suggestions") or [],
                criteria=r.get("criteria"),
            )
        )
    return models, reviewer


@router.get("/assessments/{assessment_id}", response_model=AssessmentDetail)
async def get_assessment(
    assessment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssessmentDetail:
    a = await db.scalar(
        select(Assessment).where(
            Assessment.public_id == assessment_id,
            Assessment.organization_id == user.organization_id,
        )
    )
    if a is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment not found.")
    if a.status == AssessmentStatus.completed:
        await quickstart.mark_result_viewed(db, user.organization_id)
    models, reviewer = _models(a.model_results)
    processing = (
        (a.completed_at - a.started_at).total_seconds() if a.completed_at and a.started_at else None
    )
    return AssessmentDetail(
        **_summary(a),
        assignment_requirements=a.assignment_requirements,
        code=a.submission_code,
        rubric=a.rubric,
        criteria=a.criteria,
        feedback=a.feedback,
        rubric_scores=a.rubric_scores,
        models=models,
        reviewer_model=reviewer,
        processing_seconds=round(processing, 1) if processing is not None else None,
        error_code=a.error_code,
        error_message=a.error_message,
    )
