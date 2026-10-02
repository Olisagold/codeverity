"""Public assessments API, authenticated with API keys.

Every lookup is scoped to the caller's organization and environment, so test
keys never see live assessments and vice versa.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ApiCaller, get_api_caller, get_db
from app.models.assessment import Assessment, AssessmentStatus
from app.schemas.assessments import AssessmentCreate, AssessmentOut, AssessmentResult
from app.services import assessments

router = APIRouter(prefix="/assessments", tags=["assessments"])


def _to_out(assessment: Assessment) -> AssessmentOut:
    return AssessmentOut(
        id=assessment.public_id,
        status=assessment.status,
        language=assessment.language,
        created_at=assessment.created_at,
        completed_at=assessment.completed_at,
    )


async def _scoped_or_404(db: AsyncSession, assessment_id: str, caller: ApiCaller) -> Assessment:
    try:
        return await assessments.get_scoped(
            db,
            assessment_id,
            organization_id=caller.organization_id,
            environment=caller.environment,
        )
    except assessments.AssessmentNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment not found.") from exc


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_202_ACCEPTED)
async def create_assessment(
    body: AssessmentCreate,
    caller: ApiCaller = Depends(get_api_caller),
    db: AsyncSession = Depends(get_db),
) -> AssessmentOut:
    """Accept a submission and queue it. Poll the assessment or use webhooks for the result."""
    assessment = await assessments.create(
        db,
        organization_id=caller.organization_id,
        api_key_id=caller.api_key.id,
        environment=caller.environment,
        body=body,
    )
    return _to_out(assessment)


@router.get("/{assessment_id}", response_model=AssessmentOut)
async def get_assessment(
    assessment_id: str,
    caller: ApiCaller = Depends(get_api_caller),
    db: AsyncSession = Depends(get_db),
) -> AssessmentOut:
    return _to_out(await _scoped_or_404(db, assessment_id, caller))


@router.get(
    "/{assessment_id}/result",
    response_model=AssessmentResult,
    responses={409: {"description": "Not finished yet"}, 422: {"description": "Assessment failed"}},
)
async def get_assessment_result(
    assessment_id: str,
    caller: ApiCaller = Depends(get_api_caller),
    db: AsyncSession = Depends(get_db),
) -> AssessmentResult | JSONResponse:
    assessment = await _scoped_or_404(db, assessment_id, caller)

    if assessment.status in (AssessmentStatus.queued, AssessmentStatus.processing):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "detail": "The assessment has not finished yet.",
                "status": assessment.status.value,
            },
        )
    if assessment.status == AssessmentStatus.failed:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": assessment.error_message or "The assessment could not be completed.",
                "status": assessment.status.value,
                "code": assessment.error_code,
            },
        )

    return AssessmentResult.from_assessment(assessment)
