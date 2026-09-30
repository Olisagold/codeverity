import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ApiKeyEnvironment

__all__ = ["ApiKey", "ApiKeyEnvironment"]


class ApiKey(Base):
    """A secret credential an organization uses to call the public API.

    The full key is shown once at creation and never stored. We keep a SHA-256
    hash of it for verification, a short non-secret `prefix` for fast lookup,
    and the last four characters so the dashboard can show a masked key.
    """

    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )

    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(255))
    environment: Mapped[ApiKeyEnvironment] = mapped_column(
        Enum(ApiKeyEnvironment, native_enum=False, length=10)
    )

    prefix: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True)
    last_four: Mapped[str] = mapped_column(String(4))

    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship()  # noqa: F821

    @property
    def is_active(self) -> bool:
        return self.revoked_at is None
