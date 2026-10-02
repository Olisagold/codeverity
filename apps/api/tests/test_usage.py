"""Request logging middleware, the logs and usage endpoints, and log pruning."""

import asyncio
import uuid
from collections.abc import Awaitable, Callable, Iterator
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import create_access_token
from app.main import app
from app.models.api_key import ApiKey, ApiKeyEnvironment
from app.models.assessment import Assessment
from app.models.organization import Organization
from app.models.request_log import RequestLog
from app.models.user import User
from app.services import api_keys as key_service
from app.services import usage as usage_service

PAYLOAD = {
    "language": "python",
    "assignment": {"title": "Max", "requirements": "Return the max."},
    "submission": {"code": "def f(xs):\n    return max(xs)\n"},
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
    user: User
    test: str
    live: str
    test_key_id: str

    @property
    def session(self) -> dict[str, str]:
        token = create_access_token(str(self.user.id), str(self.user.organization_id))
        return {"Authorization": f"Bearer {token}"}


def _make_org() -> Org:
    suffix = uuid.uuid4().hex[:10]

    async def _do(db: AsyncSession) -> Org:
        org = Organization(name=f"Usage {suffix}", slug=f"usage-{suffix}")
        db.add(org)
        await db.flush()
        user = User(
            email=f"usage-{suffix}@example.com",
            name="Usage",
            email_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        await db.commit()
        test_key, test = await key_service.create(
            db,
            organization_id=org.id,
            created_by_id=user.id,
            name="Dev",
            environment=ApiKeyEnvironment.test,
        )
        _, live = await key_service.create(
            db,
            organization_id=org.id,
            created_by_id=user.id,
            name="Prod",
            environment=ApiKeyEnvironment.live,
        )
        return Org(user=user, test=test, live=live, test_key_id=test_key.public_id)

    return _run_db(_do)


def _remove(org: Org) -> None:
    org_id = org.user.organization_id

    async def _do(db: AsyncSession) -> None:
        for model in (RequestLog, Assessment, ApiKey):
            await db.execute(delete(model).where(model.organization_id == org_id))
        await db.execute(delete(User).where(User.id == org.user.id))
        await db.execute(delete(Organization).where(Organization.id == org_id))
        await db.commit()

    _run_db(_do)


@pytest.fixture
def org() -> Iterator[Org]:
    created = _make_org()
    yield created
    _remove(created)


@pytest.fixture
def other_org() -> Iterator[Org]:
    created = _make_org()
    yield created
    _remove(created)


def _key(value: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {value}"}


# ── Logging ──────────────────────────────────────────────


def test_api_request_is_logged_with_request_id(client: TestClient, org: Org) -> None:
    response = client.post("/v1/assessments", headers=_key(org.test), json=PAYLOAD)
    request_id = response.headers["X-Request-Id"]
    assert request_id.startswith("req_")

    [entry] = client.get("/v1/logs", headers=org.session).json()["data"]
    assert entry["id"] == request_id
    assert entry["method"] == "POST"
    assert entry["path"] == "/v1/assessments"
    assert entry["status"] == 202
    assert entry["environment"] == "test"
    assert entry["api_key"]["name"] == "Dev"
    assert entry["duration_ms"] >= 0

    detail = client.get(f"/v1/logs/{request_id}", headers=org.session)
    assert detail.status_code == 200
    assert detail.json() == entry


def test_unattributed_and_dashboard_requests_are_not_logged(client: TestClient, org: Org) -> None:
    missing = client.get("/v1/assessments/asm_x")
    assert missing.status_code == 401
    assert missing.headers["X-Request-Id"].startswith("req_")
    client.get("/v1/assessments/asm_x", headers=_key("sk_test_bad_key"))
    client.get("/v1/webhooks", headers=org.session)

    assert client.get("/v1/logs", headers=org.session).json()["data"] == []


def test_log_filters_and_pagination(client: TestClient, org: Org) -> None:
    client.post("/v1/assessments", headers=_key(org.test), json=PAYLOAD)
    client.get("/v1/assessments/asm_missing", headers=_key(org.test))
    client.get("/v1/assessments/asm_missing", headers=_key(org.live))

    def ids(**params) -> list[int]:
        body = client.get("/v1/logs", headers=org.session, params=params).json()
        return [entry["status"] for entry in body["data"]]

    assert ids() == [404, 404, 202]
    assert ids(status="error") == [404, 404]
    assert ids(status="success") == [202]
    assert ids(environment="live") == [404]
    assert ids(api_key_id=org.test_key_id) == [404, 202]
    assert ids(method="post") == [202]

    first = client.get("/v1/logs", headers=org.session, params={"limit": 2}).json()
    assert len(first["data"]) == 2
    rest = client.get(
        "/v1/logs", headers=org.session, params={"limit": 2, "before": first["next_cursor"]}
    ).json()
    assert [e["status"] for e in rest["data"]] == [202]
    assert rest["next_cursor"] is None


def test_logs_are_scoped_to_organization(client: TestClient, org: Org, other_org: Org) -> None:
    request_id = client.get("/v1/assessments/asm_x", headers=_key(org.test)).headers["X-Request-Id"]
    assert client.get("/v1/logs", headers=other_org.session).json()["data"] == []
    assert client.get(f"/v1/logs/{request_id}", headers=other_org.session).status_code == 404


def test_logs_require_session(client: TestClient, org: Org) -> None:
    assert client.get("/v1/logs").status_code == 401
    assert client.get("/v1/usage", headers=_key(org.test)).status_code == 401


# ── Usage ────────────────────────────────────────────────


def test_usage_counts_requests_and_assessments(client: TestClient, org: Org) -> None:
    client.post("/v1/assessments", headers=_key(org.test), json=PAYLOAD)
    client.post("/v1/assessments", headers=_key(org.test), json=PAYLOAD)
    client.get("/v1/assessments/asm_missing", headers=_key(org.live))

    body = client.get("/v1/usage", headers=org.session).json()
    assert body["range"] == "7d"
    assert body["totals"] == {
        "requests": 3,
        "assessments": 2,
        "completed": 0,
        "failed": 0,
        "avg_processing_seconds": None,
    }
    assert len(body["series"]) == 7
    today = body["series"][-1]
    assert today["date"] == datetime.now(UTC).date().isoformat()
    assert (today["requests"], today["assessments"]) == (3, 2)
    assert {(k["api_key"]["name"], k["requests"], k["assessments"]) for k in body["by_key"]} == {
        ("Dev", 2, 2),
        ("Prod", 1, 0),
    }

    live = client.get("/v1/usage", headers=org.session, params={"environment": "live"}).json()
    assert live["totals"]["requests"] == 1
    assert live["totals"]["assessments"] == 0

    month = client.get("/v1/usage", headers=org.session, params={"range": "30d"}).json()
    assert len(month["series"]) == 30


# ── Retention ────────────────────────────────────────────


def test_prune_deletes_only_old_logs(client: TestClient, org: Org) -> None:
    client.get("/v1/assessments/asm_x", headers=_key(org.test))
    org_id = org.user.organization_id

    async def _do(db: AsyncSession) -> list[RequestLog]:
        db.add(
            RequestLog(
                organization_id=org_id,
                environment=ApiKeyEnvironment.test,
                method="GET",
                path="/v1/old",
                status_code=200,
                duration_ms=1,
                created_at=datetime.now(UTC) - timedelta(days=31),
            )
        )
        await db.commit()
        await usage_service.prune_logs(db, 30)
        result = await db.scalars(select(RequestLog).where(RequestLog.organization_id == org_id))
        return list(result)

    remaining = _run_db(_do)
    assert [entry.path for entry in remaining] == ["/v1/assessments/asm_x"]
