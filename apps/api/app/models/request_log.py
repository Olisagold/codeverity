import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.ids import new_id
from app.db.base import Base
from app.models.enums import ApiKeyEnvironment


class RequestLog(Base):
    """One public API request made with a recognized API key."""

    __tablename__ = "request_logs"
    __table_args__ = (Index("ix_request_logs_org_created", "organization_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Also returned to the caller as the X-Request-Id header.
    public_id: Mapped[str] = mapped_column(
        String(40), unique=True, index=True, default=lambda: new_id("req")
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE")
    )
    api_key_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("api_keys.id", ondelete="SET NULL"), index=True
    )
    environment: Mapped[ApiKeyEnvironment] = mapped_column(
        Enum(ApiKeyEnvironment, native_enum=False, length=10)
    )
    method: Mapped[str] = mapped_column(String(10))
    path: Mapped[str] = mapped_column(String(500))
    status_code: Mapped[int] = mapped_column(Integer)
    duration_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
