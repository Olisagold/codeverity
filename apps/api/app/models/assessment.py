import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.ids import new_id
from app.db.base import Base
from app.models.api_key import ApiKeyEnvironment


class AssessmentStatus(enum.StrEnum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Assessment(Base):
    """One submission sent for assessment.

    The table doubles as the job queue: the worker claims `queued` rows with
    `FOR UPDATE SKIP LOCKED`, so an accepted assessment can never be lost
    between being saved and being queued.
    """

    __tablename__ = "assessments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    public_id: Mapped[str] = mapped_column(
        String(40), unique=True, index=True, default=lambda: new_id("asm")
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    api_key_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("api_keys.id", ondelete="SET NULL")
    )
    # Copied from the key at creation so test and live data stay separate even
    # if the key is later revoked or deleted.
    environment: Mapped[ApiKeyEnvironment] = mapped_column(
        Enum(ApiKeyEnvironment, native_enum=False, length=10)
    )

    language: Mapped[str] = mapped_column(String(50))
    assignment_title: Mapped[str] = mapped_column(String(200))
    assignment_requirements: Mapped[str] = mapped_column(Text)
    submission_code: Mapped[str] = mapped_column(Text)

    status: Mapped[AssessmentStatus] = mapped_column(
        Enum(AssessmentStatus, native_enum=False, length=20),
        default=AssessmentStatus.queued,
        index=True,
    )
    attempts: Mapped[int] = mapped_column(Integer, default=0)

    # Result, filled in when the assessment completes.
    score: Mapped[float | None] = mapped_column(Float)
    confidence: Mapped[float | None] = mapped_column(Float)
    criteria: Mapped[dict | None] = mapped_column(JSONB)
    feedback: Mapped[dict | None] = mapped_column(JSONB)
    # Per-model output, kept for the dashboard and for debugging (Phase 3).
    model_results: Mapped[list | None] = mapped_column(JSONB)

    # Why it failed, when status is `failed`.
    error_code: Mapped[str | None] = mapped_column(String(50))
    error_message: Mapped[str | None] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
