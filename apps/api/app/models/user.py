import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuthProvider(str, enum.Enum):
    password = "password"
    google = "google"


class UserRole(str, enum.Enum):
    owner = "owner"
    member = "member"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255))

    # Nullable because Google-only users never set one.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider, native_enum=False, length=20), default=AuthProvider.password
    )

    # Google's stable per-user id ("sub" claim). Unique and nullable so
    # password-only users simply don't have one.
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False, length=20), default=UserRole.owner)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship(back_populates="users")  # noqa: F821
