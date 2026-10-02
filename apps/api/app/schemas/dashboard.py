from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import AssessmentStatus
from app.schemas.assessments import RubricScore


class SessionUser(BaseModel):
    id: str
    name: str
    email: str
    # False for accounts created with Google or GitHub that never set one.
    has_password: bool


class PasswordChange(BaseModel):
    current_password: str | None = None
    new_password: str = Field(min_length=8, max_length=128)


class Member(BaseModel):
    name: str
    email: str


class SessionOrganization(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime
    members: list[Member]


class SessionOut(BaseModel):
    user: SessionUser
    organization: SessionOrganization


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$")


AssessmentRange = Literal["7d", "30d", "90d", "all"]


class AssessmentSummary(BaseModel):
    id: str
    status: AssessmentStatus
    environment: ApiKeyEnvironment
    language: str
    title: str
    score: float | None
    confidence: float | None
    rubric_score: float | None
    created_at: datetime
    completed_at: datetime | None


class AssessmentPage(BaseModel):
    data: list[AssessmentSummary]
    next_cursor: str | None
    # Every language this organization has submitted, for the filter menu.
    languages: list[str]


class ModelResult(BaseModel):
    provider: str
    model: str | None
    status: str
    latency_ms: int | None
    error: str | None
    summary: str | None
    issues: list[str]
    suggestions: list[str]
    criteria: dict[str, float] | None


class AssessmentDetail(AssessmentSummary):
    assignment_requirements: str
    code: str
    rubric: dict | None
    criteria: dict[str, float] | None
    feedback: dict | None
    rubric_scores: list[RubricScore] | None
    models: list[ModelResult]
    reviewer_model: str | None
    processing_seconds: float | None
    error_code: str | None
    error_message: str | None


class QuickstartOut(BaseModel):
    """Which quickstart steps the organization has done. Creating it is always done."""

    api_key: bool
    assessment: bool
    webhook: bool
    result_viewed: bool
    # Where "View your first result" sends the user, once there is one.
    first_completed_assessment_id: str | None
    dismissed: bool
