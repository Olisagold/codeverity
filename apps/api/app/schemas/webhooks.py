import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models.api_key import ApiKeyEnvironment
from app.models.webhook import DeliveryStatus

EventType = Literal["assessment.completed", "assessment.failed"]
ALL_EVENTS: list[EventType] = ["assessment.completed", "assessment.failed"]


class WebhookCreate(BaseModel):
    url: str = Field(min_length=1, max_length=2048)
    environment: ApiKeyEnvironment = ApiKeyEnvironment.test
    description: str | None = Field(default=None, max_length=255)
    events: list[EventType] = Field(default_factory=lambda: list(ALL_EVENTS), min_length=1)


class WebhookUpdate(BaseModel):
    url: str | None = Field(default=None, min_length=1, max_length=2048)
    description: str | None = Field(default=None, max_length=255)
    events: list[EventType] | None = Field(default=None, min_length=1)
    active: bool | None = None


class WebhookOut(BaseModel):
    id: uuid.UUID
    url: str
    environment: ApiKeyEnvironment
    description: str | None
    events: list[str]
    active: bool
    created_at: datetime
    last_delivery_at: datetime | None = None


class WebhookWithSecret(WebhookOut):
    """Returned from creation and secret rotation only."""

    secret: str


class DeliveryOut(BaseModel):
    id: uuid.UUID
    event_id: str
    event_type: str
    payload: dict
    status: DeliveryStatus
    attempts: int
    last_status_code: int | None
    last_error: str | None
    created_at: datetime
    delivered_at: datetime | None
