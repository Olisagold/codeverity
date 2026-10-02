"""Assessments API and worker.

Runs against the real local Postgres. Each test gets its own organization with
a live and a test key; everything is removed afterwards. Worker behaviour is
exercised by calling `process_next` directly instead of running the loop.
"""

import asyncio
import time
import uuid
from collections.abc import Awaitable, Callable, Iterator
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.ids import new_id, ulid
from app.core.security import create_access_token
from app.main import app
from app.models.api_key import ApiKey, ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from app.models.organization import Organization
from app.models.user import User
from app.services import api_keys as key_service
from app.services import assessments as assessment_service
from app.services.orchestration import processor
from app.worker.main import process_next

PAYLOAD = {
    "language": "Python",
    "assignment": {
        "title": "Find the maximum number",
        "requirements": "Return the largest number from a list of integers.",
    },
    "submission": {"code": "def find_max(numbers):\n    return max(numbers)\n"},
}


@pytest.fixture(scope="module")
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def _run_db[T](fn: Callable[[AsyncSession], Awaitable[T]]) -> T:
    async def _inner() -> T:
        engine = create_async_engine(get_settings().async_database_url)
        try:
            session_factory = async_sessionmaker(engine, expire_on_commit=False)
            async with session_factory() as db:
                return await fn(db)
        finally:
            await engine.dispose()

    return asyncio.run(_inner())


@dataclass
class Org:
    org: Organization
    user: User
    live: str
    test: str


def _make_org() -> Org:
    suffix = uuid.uuid4().hex[:10]

    async def _do(db: AsyncSession) -> Org:
        org = Organization(name=f"Asm Org {suffix}", slug=f"asm-org-{suffix}")
        db.add(org)
        await db.flush()
        user = User(
            email=f"asm-{suffix}@example.com",
            name="Asm",
            email_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        await db.commit()
        _, live = await key_service.create(
            db,
            organization_id=org.id,
            created_by_id=user.id,
            name="Live",
            environment=ApiKeyEnvironment.live,
        )
        _, test = await key_service.create(
            db,
            organization_id=org.id,
            created_by_id=user.id,
            name="Test",
            environment=ApiKeyEnvironment.test,
        )
        return Org(org=org, user=user, live=live, test=test)

    return _run_db(_do)


def _remove_org(org: Org) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(delete(Assessment).where(Assessment.organization_id == org.org.id))
        await db.execute(delete(ApiKey).where(ApiKey.organization_id == org.org.id))
        await db.execute(delete(User).where(User.id == org.user.id))
        await db.execute(delete(Organization).where(Organization.id == org.org.id))
        await db.commit()

    _run_db(_do)


@pytest.fixture
def org() -> Iterator[Org]:
    created = _make_org()
    yield created
    _remove_org(created)


@pytest.fixture
def other_org() -> Iterator[Org]:
    created = _make_org()
    yield created
    _remove_org(created)


def _bearer(value: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {value}"}


def _create(client: TestClient, key: str, payload: dict | None = None) -> dict:
    response = client.post("/v1/assessments", headers=_bearer(key), json=payload or PAYLOAD)
    assert response.status_code == 202, response.text
    return response.json()


def _load(public_id: str) -> Assessment:
    return _run_db(
        lambda db: db.scalar(select(Assessment).where(Assessment.public_id == public_id))
    )


def _drain() -> None:
    """Run the worker until the queue is empty."""

    async def _do(db: AsyncSession) -> None:
        for _ in range(100):
            if not await process_next(db):
                return

    _run_db(_do)


# ── Create ───────────────────────────────────────────────


def test_create_queues_assessment(client: TestClient, org: Org) -> None:
    body = _create(client, org.test)
    assert body["id"].startswith("asm_") and len(body["id"]) == 30
    assert body["status"] == "queued"
    assert body["language"] == "python"
    assert body["completed_at"] is None

    stored = _load(body["id"])
    assert stored.organization_id == org.org.id
    assert stored.environment == ApiKeyEnvironment.test
    assert stored.assignment_title == PAYLOAD["assignment"]["title"]
    assert stored.submission_code == PAYLOAD["submission"]["code"]
    assert stored.attempts == 0


def test_create_requires_api_key(client: TestClient, org: Org) -> None:
    assert client.post("/v1/assessments", json=PAYLOAD).status_code == 401
    session = create_access_token(str(org.user.id), str(org.org.id))
    assert client.post("/v1/assessments", headers=_bearer(session), json=PAYLOAD).status_code == 401


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {**PAYLOAD, "language": ""},
        {**PAYLOAD, "submission": {"code": ""}},
        {**PAYLOAD, "assignment": {"title": "x" * 201, "requirements": "r"}},
        {**PAYLOAD, "submission": {"code": "x" * 100_001}},
        {"language": "python", "assignment": {"title": "t"}, "submission": {"code": "c"}},
    ],
)
def test_create_validates_input(client: TestClient, org: Org, payload: dict) -> None:
    response = client.post("/v1/assessments", headers=_bearer(org.test), json=payload)
    assert response.status_code == 422


# ── Retrieve and isolation ───────────────────────────────


def test_get_own_assessment(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    fetched = client.get(f"/v1/assessments/{created['id']}", headers=_bearer(org.test))
    assert fetched.status_code == 200
    assert fetched.json()["id"] == created["id"]
    assert fetched.json()["status"] == "queued"


def test_other_org_cannot_read(client: TestClient, org: Org, other_org: Org) -> None:
    created = _create(client, org.test)
    headers = _bearer(other_org.test)
    assert client.get(f"/v1/assessments/{created['id']}", headers=headers).status_code == 404
    assert client.get(f"/v1/assessments/{created['id']}/result", headers=headers).status_code == 404


def test_test_and_live_are_separate(client: TestClient, org: Org) -> None:
    live = _create(client, org.live)
    test = _create(client, org.test)
    assert client.get(f"/v1/assessments/{live['id']}", headers=_bearer(org.test)).status_code == 404
    assert client.get(f"/v1/assessments/{test['id']}", headers=_bearer(org.live)).status_code == 404


def test_unknown_assessment(client: TestClient, org: Org) -> None:
    response = client.get(f"/v1/assessments/{new_id('asm')}", headers=_bearer(org.test))
    assert response.status_code == 404


def test_result_not_ready(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    response = client.get(f"/v1/assessments/{created['id']}/result", headers=_bearer(org.test))
    assert response.status_code == 409
    assert response.json()["status"] == "queued"


# ── Worker ───────────────────────────────────────────────


def test_worker_completes_test_assessment(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    _drain()

    fetched = client.get(f"/v1/assessments/{created['id']}", headers=_bearer(org.test)).json()
    assert fetched["status"] == "completed"
    assert fetched["completed_at"] is not None

    result = client.get(f"/v1/assessments/{created['id']}/result", headers=_bearer(org.test))
    assert result.status_code == 200
    body = result.json()
    assert body["assessment_id"] == created["id"]
    assert body["status"] == "completed"
    assert body["simulated"] is True
    assert set(body["criteria"]) == {
        "correctness",
        "relevance",
        "actionability",
        "specificity",
        "pedagogical_fit",
    }
    assert body["feedback"]["summary"].startswith("Simulated result")
    assert "simulated" not in body["feedback"]
    assert _load(created["id"]).attempts == 1


def test_worker_fails_live_assessment_without_provider_keys(
    client: TestClient, org: Org, monkeypatch: pytest.MonkeyPatch
) -> None:
    no_keys = get_settings().model_copy(
        update={"openai_api_key": "", "gemini_api_key": "", "deepseek_api_key": ""}
    )
    monkeypatch.setattr(processor, "get_settings", lambda: no_keys)
    created = _create(client, org.live)
    _drain()

    assert _load(created["id"]).status == AssessmentStatus.failed
    result = client.get(f"/v1/assessments/{created['id']}/result", headers=_bearer(org.live))
    assert result.status_code == 422
    assert result.json()["code"] == "ORCHESTRATION_UNAVAILABLE"
    assert result.json()["status"] == "failed"


def _set(public_id: str, **values) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(
            update(Assessment).where(Assessment.public_id == public_id).values(**values)
        )
        await db.commit()

    _run_db(_do)


def test_worker_reclaims_stuck_assessment(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    stuck_since = datetime.now(UTC) - assessment_service.PROCESSING_TIMEOUT - timedelta(minutes=1)
    _set(created["id"], status=AssessmentStatus.processing, started_at=stuck_since, attempts=1)
    _drain()

    stored = _load(created["id"])
    assert stored.status == AssessmentStatus.completed
    assert stored.attempts == 2


def test_worker_leaves_recent_processing_alone(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    _set(
        created["id"], status=AssessmentStatus.processing, started_at=datetime.now(UTC), attempts=1
    )
    _drain()
    assert _load(created["id"]).status == AssessmentStatus.processing


def test_worker_gives_up_after_max_attempts(client: TestClient, org: Org) -> None:
    created = _create(client, org.test)
    stuck_since = datetime.now(UTC) - assessment_service.PROCESSING_TIMEOUT - timedelta(minutes=1)
    _set(
        created["id"],
        status=AssessmentStatus.processing,
        started_at=stuck_since,
        attempts=assessment_service.MAX_ATTEMPTS,
    )
    _drain()

    stored = _load(created["id"])
    assert stored.status == AssessmentStatus.failed
    assert stored.error_code == "PROCESSING_TIMEOUT"


def test_worker_records_unexpected_errors(
    client: TestClient, org: Org, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def boom(_assessment: Assessment):
        raise RuntimeError("provider exploded")

    monkeypatch.setattr(processor, "process", boom)
    created = _create(client, org.test)
    _drain()

    stored = _load(created["id"])
    assert stored.status == AssessmentStatus.failed
    assert stored.error_code == "INTERNAL_ERROR"
    assert "exploded" not in (stored.error_message or "")


# ── IDs ──────────────────────────────────────────────────


def test_ids_are_unique_and_time_sortable() -> None:
    first = ulid()
    time.sleep(0.002)
    second = ulid()
    assert len(first) == len(second) == 26
    assert first < second
    assert len({new_id("asm") for _ in range(1000)}) == 1000
