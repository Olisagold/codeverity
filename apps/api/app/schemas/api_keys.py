from datetime import datetime

from pydantic import BaseModel, Field

from app.models.api_key import ApiKeyEnvironment


class ApiKeyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    environment: ApiKeyEnvironment = ApiKeyEnvironment.test
    description: str | None = Field(default=None, max_length=255)


class ApiKeyOut(BaseModel):
    id: str
    name: str
    description: str | None
    environment: ApiKeyEnvironment
    masked: str
    active: bool
    last_used_at: datetime | None
    created_at: datetime


class ApiKeyCreated(ApiKeyOut):
    """Returned only from creation. `key` is the full secret and is never shown again."""

    key: str
