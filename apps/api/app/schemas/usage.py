import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel

from app.models.api_key import ApiKeyEnvironment

UsageRange = Literal["7d", "30d", "90d"]
LogStatus = Literal["success", "error"]


class KeyRef(BaseModel):
    id: uuid.UUID
    name: str


class LogOut(BaseModel):
    id: str
    method: str
    path: str
    status: int
    duration_ms: int
    environment: ApiKeyEnvironment
    api_key: KeyRef | None
    created_at: datetime


class LogPage(BaseModel):
    data: list[LogOut]
    # Pass as `before` to get the next page. Null on the last page.
    next_cursor: str | None


class UsageTotals(BaseModel):
    requests: int
    assessments: int
    completed: int
    failed: int


class UsagePoint(BaseModel):
    date: date
    requests: int
    assessments: int


class KeyUsage(BaseModel):
    api_key: KeyRef | None
    requests: int


class UsageOut(BaseModel):
    range: UsageRange
    environment: ApiKeyEnvironment | None
    totals: UsageTotals
    # One point per UTC day, oldest first, including days with no traffic.
    series: list[UsagePoint]
    by_key: list[KeyUsage]
