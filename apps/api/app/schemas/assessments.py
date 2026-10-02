import enum
from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.assessment import AssessmentStatus

MAX_CODE_CHARS = 100_000
MAX_REQUIREMENTS_CHARS = 10_000
MAX_RUBRIC_CRITERIA = 10


class AssignmentIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    requirements: str = Field(min_length=1, max_length=MAX_REQUIREMENTS_CHARS)


class SubmissionIn(BaseModel):
    code: str = Field(min_length=1, max_length=MAX_CODE_CHARS)


class LearnerLevel(enum.StrEnum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class RubricCriterion(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    weight: int = Field(ge=1, le=100)


class RubricIn(BaseModel):
    """Instructor guidance. Passed to the models as data, never as instructions."""

    criteria: list[RubricCriterion] = Field(min_length=1, max_length=MAX_RUBRIC_CRITERIA)
    learner_level: LearnerLevel | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def _check_criteria(self) -> "RubricIn":
        if sum(c.weight for c in self.criteria) != 100:
            raise ValueError("criteria weights must add up to 100")
        names = [c.name.strip().lower() for c in self.criteria]
        if len(set(names)) != len(names):
            raise ValueError("criteria names must be unique")
        return self


class AssessmentCreate(BaseModel):
    language: str = Field(min_length=1, max_length=50)
    assignment: AssignmentIn
    submission: SubmissionIn
    rubric: RubricIn | None = None


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


class RubricScore(BaseModel):
    name: str
    weight: int
    score: float
    comment: str


class AssessmentResult(BaseModel):
    assessment_id: str
    status: AssessmentStatus
    score: float
    confidence: float
    criteria: dict[str, float]
    feedback: Feedback
    # Only present when the request included a rubric. Grades the code itself.
    rubric_score: float | None = None
    rubric_scores: list[RubricScore] | None = None
    simulated: bool = False
