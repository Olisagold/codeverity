"""Webhook endpoints, event enqueueing, signing, and delivery.

Deliveries go through `httpx.MockTransport`, so nothing leaves the machine.
Rows used for delivery tests are scheduled a day ahead, so a running worker
never claims them first.
"""

import asyncio
import hashlib
import hmac
import json
import uuid
from collections.abc import Awaitable, Callable, Iterator
from datetime import UTC, datetime, timedelta

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import create_access_token
from app.main import app
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from app.models.organization import Organization
from app.models.user import User
from app.models.webhook import DeliveryStatus, WebhookDelivery, WebhookEndpoint
from app.services import assessments as assessment_service
from app.services import webhooks

URL = "http://127.0.0.1:9/hooks"


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


def _make_user() -> User:
    suffix = uuid.uuid4().hex[:10]

    async def _do(db: AsyncSession) -> User:
        org = Organization(name=f"Hook Org {suffix}", slug=f"hook-org-{suffix}")
        db.add(org)
        await db.flush()
        user = User(
            email=f"hook-{suffix}@example.com",
            name="Hook",
            email_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        await db.commit()
        return user

    return _run_db(_do)


def _remove(user: User) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(
            delete(Assessment).where(Assessment.organization_id == user.organization_id)
        )
        await db.execute(
            delete(WebhookEndpoint).where(WebhookEndpoint.organization_id == user.organization_id)
        )
        await db.execute(delete(User).where(User.id == user.id))
        await db.execute(delete(Organization).where(Organization.id == user.organization_id))
        await db.commit()

    _run_db(_do)


@pytest.fixture
def user() -> Iterator[User]:
    created = _make_user()
    yield created
    _remove(created)


@pytest.fixture
def other_user() -> Iterator[User]:
    created = _make_user()
    yield created
    _remove(created)


def _auth(user: User) -> dict[str, str]:
    token = create_access_token(str(user.id), str(user.organization_id))
    return {"Authorization": f"Bearer {token}"}


def _create(client: TestClient, user: User, **body) -> dict:
    response = client.post("/v1/webhooks", headers=_auth(user), json={"url": URL, **body})
    assert response.status_code == 201, response.text
    return response.json()


# ── Endpoint management ──────────────────────────────────


def test_create_returns_secret_once(client: TestClient, user: User) -> None:
    created = _create(client, user)
    assert created["secret"].startswith("whsec_")
    assert created["events"] == ["assessment.completed", "assessment.failed"]
    assert created["environment"] == "test"

    listed = client.get("/v1/webhooks", headers=_auth(user)).json()
    assert [w["id"] for w in listed] == [created["id"]]
    assert "secret" not in listed[0]
    fetched = client.get(f"/v1/webhooks/{created['id']}", headers=_auth(user)).json()
    assert "secret" not in fetched


def test_update_and_disable(client: TestClient, user: User) -> None:
    created = _create(client, user)
    response = client.patch(
        f"/v1/webhooks/{created['id']}",
        headers=_auth(user),
        json={"events": ["assessment.failed"], "active": False, "description": "Grades"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["events"] == ["assessment.failed"]
    assert body["active"] is False
    assert body["description"] == "Grades"


def test_rotate_secret_changes_it(client: TestClient, user: User) -> None:
    created = _create(client, user)
    rotated = client.post(f"/v1/webhooks/{created['id']}/rotate-secret", headers=_auth(user))
    assert rotated.status_code == 200
    assert rotated.json()["secret"] != created["secret"]


def test_delete(client: TestClient, user: User) -> None:
    created = _create(client, user)
    assert client.delete(f"/v1/webhooks/{created['id']}", headers=_auth(user)).status_code == 204
    assert client.get(f"/v1/webhooks/{created['id']}", headers=_auth(user)).status_code == 404


def test_other_organization_cannot_see_webhook(
    client: TestClient, user: User, other_user: User
) -> None:
    created = _create(client, user)
    path = f"/v1/webhooks/{created['id']}"
    assert client.get(path, headers=_auth(other_user)).status_code == 404
    assert client.delete(path, headers=_auth(other_user)).status_code == 404
    assert client.get("/v1/webhooks", headers=_auth(other_user)).json() == []


def test_endpoint_limit(client: TestClient, user: User) -> None:
    for _ in range(webhooks.MAX_ENDPOINTS):
        _create(client, user)
    response = client.post("/v1/webhooks", headers=_auth(user), json={"url": URL})
    assert response.status_code == 409


def test_requires_session(client: TestClient) -> None:
    assert client.get("/v1/webhooks").status_code == 401


@pytest.mark.parametrize(
    "url",
    [
        "http://example.com/hook",
        "https://localhost/hook",
        "https://10.0.0.5/hook",
        "https://169.254.169.254/latest",
        "https://user:pass@example.com/hook",
        "ftp://example.com/hook",
        "not a url",
    ],
)
def test_production_rejects_unsafe_urls(monkeypatch: pytest.MonkeyPatch, url: str) -> None:
    monkeypatch.setattr(webhooks, "_is_development", lambda: False)
    with pytest.raises(webhooks.InvalidWebhookUrl):
        webhooks.validate_url(url)


def test_production_accepts_public_https(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(webhooks, "_is_development", lambda: False)
    assert webhooks.validate_url(" https://example.com/hook ") == "https://example.com/hook"


# ── Enqueueing ───────────────────────────────────────────


def _finished_assessment(user: User, environment: ApiKeyEnvironment, *, failed: bool) -> str:
    async def _do(db: AsyncSession) -> str:
        assessment = Assessment(
            organization_id=user.organization_id,
            environment=environment,
            language="python",
            assignment_title="Max",
            assignment_requirements="Return the max.",
            submission_code="max(xs)",
            status=AssessmentStatus.processing,
        )
        db.add(assessment)
        await db.commit()
        if failed:
            await assessment_service.fail(db, assessment, "MODELS_UNAVAILABLE", "No models.")
        else:
            outcome = assessment_service.Outcome(
                score=9.0,
                confidence=0.9,
                criteria={"correctness": 9.0},
                feedback={"summary": "Good.", "issues": [], "suggestions": []},
            )
            await assessment_service.complete(db, assessment, outcome)
        return assessment.public_id

    return _run_db(_do)


def _deliveries(endpoint_id: str) -> list[WebhookDelivery]:
    async def _do(db: AsyncSession) -> list[WebhookDelivery]:
        result = await db.scalars(
            select(WebhookDelivery).where(WebhookDelivery.endpoint_id == uuid.UUID(endpoint_id))
        )
        return list(result)

    return _run_db(_do)


def test_completed_assessment_queues_event(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    public_id = _finished_assessment(user, ApiKeyEnvironment.test, failed=False)

    [delivery] = _deliveries(endpoint["id"])
    assert delivery.event_type == "assessment.completed"
    assert delivery.payload["type"] == "assessment.completed"
    assert delivery.payload["id"].startswith("evt_")
    assert delivery.payload["data"]["assessment_id"] == public_id
    assert delivery.payload["data"]["score"] == 9.0


def test_failed_assessment_queues_event(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    _finished_assessment(user, ApiKeyEnvironment.test, failed=True)

    [delivery] = _deliveries(endpoint["id"])
    assert delivery.event_type == "assessment.failed"
    assert delivery.payload["data"]["error"]["code"] == "MODELS_UNAVAILABLE"


def test_events_respect_environment_subscription_and_status(client: TestClient, user: User) -> None:
    live = _create(client, user, environment="live")
    failed_only = _create(client, user, events=["assessment.failed"])
    disabled = _create(client, user)
    client.patch(f"/v1/webhooks/{disabled['id']}", headers=_auth(user), json={"active": False})

    _finished_assessment(user, ApiKeyEnvironment.test, failed=False)

    assert _deliveries(live["id"]) == []
    assert _deliveries(failed_only["id"]) == []
    assert _deliveries(disabled["id"]) == []


# ── Delivery ─────────────────────────────────────────────


def _future_delivery(endpoint_id: str) -> uuid.UUID:
    async def _do(db: AsyncSession) -> uuid.UUID:
        delivery = WebhookDelivery(
            endpoint_id=uuid.UUID(endpoint_id),
            event_id="evt_test",
            event_type="webhook.test",
            payload={"id": "evt_test", "type": "webhook.test", "data": {}},
            next_attempt_at=datetime.now(UTC) + timedelta(days=1),
        )
        db.add(delivery)
        await db.commit()
        return delivery.id

    return _run_db(_do)


def _attempt(delivery_id: uuid.UUID, handler, *, attempts: int | None = None) -> WebhookDelivery:
    async def _do(db: AsyncSession) -> WebhookDelivery:
        delivery = await db.get(WebhookDelivery, delivery_id)
        if attempts is not None:
            delivery.attempts = attempts
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
            await webhooks.attempt(db, http, delivery)
        return delivery

    return _run_db(_do)


def test_successful_delivery_is_signed(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(204)

    delivery = _attempt(_future_delivery(endpoint["id"]), handler)

    assert delivery.status == DeliveryStatus.succeeded
    assert delivery.attempts == 1
    assert delivery.delivered_at is not None
    [request] = seen
    assert request.headers["Codeverity-Event"] == "webhook.test"
    timestamp, signature = (
        part.split("=", 1)[1] for part in request.headers["Codeverity-Signature"].split(",")
    )
    expected = hmac.new(
        endpoint["secret"].encode(), f"{timestamp}.".encode() + request.content, hashlib.sha256
    ).hexdigest()
    assert hmac.compare_digest(signature, expected)
    assert json.loads(request.content)["type"] == "webhook.test"


def test_failed_delivery_is_retried_later(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    delivery = _attempt(_future_delivery(endpoint["id"]), lambda r: httpx.Response(500))

    assert delivery.status == DeliveryStatus.pending
    assert delivery.attempts == 1
    assert delivery.last_status_code == 500
    assert delivery.next_attempt_at > datetime.now(UTC) + timedelta(seconds=30)


def test_delivery_gives_up_after_max_attempts(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    delivery = _attempt(
        _future_delivery(endpoint["id"]),
        lambda r: httpx.Response(503),
        attempts=webhooks.MAX_ATTEMPTS - 1,
    )
    assert delivery.status == DeliveryStatus.failed
    assert delivery.attempts == webhooks.MAX_ATTEMPTS


def test_delivery_to_disabled_endpoint_fails(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    client.patch(f"/v1/webhooks/{endpoint['id']}", headers=_auth(user), json={"active": False})
    delivery = _attempt(_future_delivery(endpoint["id"]), lambda r: httpx.Response(200))
    assert delivery.status == DeliveryStatus.failed
    assert delivery.last_error == "endpoint disabled"


def test_send_test_and_list_deliveries(client: TestClient, user: User) -> None:
    endpoint = _create(client, user)
    queued = client.post(f"/v1/webhooks/{endpoint['id']}/test", headers=_auth(user))
    assert queued.status_code == 202
    assert queued.json()["event_type"] == "webhook.test"

    listed = client.get(f"/v1/webhooks/{endpoint['id']}/deliveries", headers=_auth(user)).json()
    assert [d["id"] for d in listed] == [queued.json()["id"]]
