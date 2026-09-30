from datetime import datetime

from pydantic import BaseModel, Field

from app.models.assessment import AssessmentStatus

MAX_CODE_CHARS = 100_000
MAX_REQUIREMENTS_CHARS = 10_000


class AssignmentIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    requirements: str = Field(min_length=1, max_length=MAX_REQUIREMENTS_CHARS)


class SubmissionIn(BaseModel):
    code: str = Field(min_length=1, max_length=MAX_CODE_CHARS)


class AssessmentCreate(BaseModel):
    language: str = Field(min_length=1, max_length=50)
    assignment: AssignmentIn
    submission: SubmissionIn


class AssessmentOut(BaseModel):
    id: str
    status: AssessmentStatus
    language: str
    created_at: datetime
    completed_at: datetime | None = None


class Feedback(BaseModel):
    summary: str
    issues: list[str] = []
    suggestions: list[str] = []


class AssessmentResult(BaseModel):
    assessment_id: str
    status: AssessmentStatus
    score: float
    confidence: float
    criteria: dict[str, float]
    feedback: Feedback
    simulated: bool = False
