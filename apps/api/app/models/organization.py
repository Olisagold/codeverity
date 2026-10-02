import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.ids import new_id
from app.db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Shown in the API and dashboard instead of the internal UUID.
    public_id: Mapped[str] = mapped_column(
        String(40), unique=True, index=True, default=lambda: new_id("org")
    )
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Dashboard quickstart: when someone first saw a finished result, and when
    # the checklist was dismissed.
    first_result_viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    quickstart_dismissed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    users: Mapped[list["User"]] = relationship(back_populates="organization")  # noqa: F821
