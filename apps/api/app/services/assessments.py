"""Assessments: creation, lookup, and the worker's claim/complete/fail cycle.

Routes and the worker both go through here. Lookups are always scoped to an
organization *and* environment, so test keys never see live data.
"""

import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from app.schemas.assessments import AssessmentCreate

# A job still `processing` after this long is assumed to belong to a worker
# that died, and is picked up again.
PROCESSING_TIMEOUT = timedelta(minutes=10)
MAX_ATTEMPTS = 3


class AssessmentNotFound(Exception):
    pass


@dataclass
class Outcome:
    """What a processor produces for one assessment."""

    score: float
    confidence: float
    criteria: dict[str, float]
    feedback: dict
    model_results: list = field(default_factory=list)
    rubric_score: float | None = None
    rubric_scores: list | None = None


class ProcessingError(Exception):
    """A processor couldn't produce a result. `code` is stored and shown to the caller."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


# ── API side ──────────────────────────────────────────────


async def create(
    db: AsyncSession,
    *,
    organization_id: uuid.UUID,
    api_key_id: uuid.UUID | None,
    environment: ApiKeyEnvironment,
    body: AssessmentCreate,
) -> Assessment:
    assessment = Assessment(
        organization_id=organization_id,
        api_key_id=api_key_id,
        environment=environment,
        language=body.language.strip().lower(),
        assignment_title=body.assignment.title.strip(),
        assignment_requirements=body.assignment.requirements,
        submission_code=body.submission.code,
        rubric=body.rubric.model_dump(mode="json") if body.rubric else None,
        status=AssessmentStatus.queued,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


async def get_scoped(
    db: AsyncSession,
    public_id: str,
    *,
    organization_id: uuid.UUID,
    environment: ApiKeyEnvironment,
) -> Assessment:
    assessment = await db.scalar(
        select(Assessment).where(
            Assessment.public_id == public_id,
            Assessment.organization_id == organization_id,
            Assessment.environment == environment,
        )
    )
    if assessment is None:
        raise AssessmentNotFound
    return assessment


# ── Worker side ───────────────────────────────────────────


async def claim_next(db: AsyncSession) -> Assessment | None:
    """Claim the oldest runnable assessment and mark it `processing`.

    Runnable means `queued`, or `processing` for longer than PROCESSING_TIMEOUT
    (its worker died). Rows locked by another worker are skipped, so any number
    of workers can run side by side. Jobs that have used up MAX_ATTEMPTS are
    marked failed instead of being claimed.
    """
    now = datetime.now(UTC)
    stale_before = now - PROCESSING_TIMEOUT

    while True:
        assessment = await db.scalar(
            select(Assessment)
            .where(
                or_(
                    Assessment.status == AssessmentStatus.queued,
                    (Assessment.status == AssessmentStatus.processing)
                    & (Assessment.started_at < stale_before),
                )
            )
            .order_by(Assessment.created_at)
            .limit(1)
            .with_for_update(skip_locked=True)
        )
        if assessment is None:
            await db.rollback()
            return None

        if assessment.attempts >= MAX_ATTEMPTS:
            _mark_failed(
                assessment,
                "PROCESSING_TIMEOUT",
                "The assessment did not finish after several attempts.",
                now,
            )
            await db.commit()
            continue

        assessment.status = AssessmentStatus.processing
        assessment.attempts += 1
        assessment.started_at = now
        await db.commit()
        return assessment


async def complete(db: AsyncSession, assessment: Assessment, outcome: Outcome) -> None:
    assessment.status = AssessmentStatus.completed
    assessment.score = outcome.score
    assessment.confidence = outcome.confidence
    assessment.criteria = outcome.criteria
    assessment.feedback = outcome.feedback
    assessment.model_results = outcome.model_results
    assessment.rubric_score = outcome.rubric_score
    assessment.rubric_scores = outcome.rubric_scores
    assessment.error_code = None
    assessment.error_message = None
    assessment.completed_at = datetime.now(UTC)
    await db.commit()


async def fail(db: AsyncSession, assessment: Assessment, code: str, message: str) -> None:
    _mark_failed(assessment, code, message, datetime.now(UTC))
    await db.commit()


def _mark_failed(assessment: Assessment, code: str, message: str, when: datetime) -> None:
    assessment.status = AssessmentStatus.failed
    assessment.error_code = code
    assessment.error_message = message[:500]
    assessment.completed_at = when
