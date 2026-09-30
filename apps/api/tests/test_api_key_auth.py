"""API key authentication for the public API, exercised through GET /v1/me.

Runs against the real local Postgres, like the other tests. Each test gets its
own organization, user and key, removed afterwards.
"""
import asyncio
import uuid
from collections.abc import Awaitable, Callable, Iterator
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import create_access_token
from app.main import app
from app.models.api_key import ApiKey, ApiKeyEnvironment
from app.models.organization import Organization
from app.models.user import User
from app.services import api_keys as key_service


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
class Setup:
    user: User
    org: Organization
    key: ApiKey
    secret: str


def _setup(environment: ApiKeyEnvironment = ApiKeyEnvironment.live) -> Setup:
    suffix = uuid.uuid4().hex[:10]

    async def _do(db: AsyncSession) -> Setup:
        org = Organization(name=f"Auth Org {suffix}", slug=f"auth-org-{suffix}")
        db.add(org)
        await db.flush()
        user = User(
            email=f"keyauth-{suffix}@example.com",
            name="Key Auth",
            email_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        await db.commit()
        key, secret = await key_service.create(
            db,
            organization_id=org.id,
            created_by_id=user.id,
            name="Integration",
            environment=environment,
        )
        return Setup(user=user, org=org, key=key, secret=secret)

    return _run_db(_do)


def _teardown(setup: Setup) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(delete(ApiKey).where(ApiKey.organization_id == setup.org.id))
        await db.execute(delete(User).where(User.id == setup.user.id))
        await db.execute(delete(Organization).where(Organization.id == setup.org.id))
        await db.commit()

    _run_db(_do)


def _load_key(key_id: uuid.UUID) -> ApiKey:
    return _run_db(lambda db: db.get(ApiKey, key_id))


def _set_last_used(key_id: uuid.UUID, value: datetime | None) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(update(ApiKey).where(ApiKey.id == key_id).values(last_used_at=value))
        await db.commit()

    _run_db(_do)


def _bearer(value: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {value}"}


@pytest.fixture
def live() -> Iterator[Setup]:
    created = _setup(ApiKeyEnvironment.live)
    yield created
    _teardown(created)


@pytest.fixture
def test_env() -> Iterator[Setup]:
    created = _setup(ApiKeyEnvironment.test)
    yield created
    _teardown(created)


# ── Accepted ─────────────────────────────────────────────


def test_valid_key_identifies_organization(client: TestClient, live: Setup) -> None:
    response = client.get("/v1/me", headers=_bearer(live.secret))
    assert response.status_code == 200
    body = response.json()
    assert body["organization"] == {
        "id": str(live.org.id),
        "name": live.org.name,
        "slug": live.org.slug,
    }
    assert body["api_key"]["id"] == str(live.key.id)
    assert body["api_key"]["environment"] == "live"
    assert body["api_key"]["masked"] == f"sk_live_••••••{live.secret[-4:]}"
    assert live.secret not in response.text


def test_test_key_reports_test_environment(client: TestClient, test_env: Setup) -> None:
    response = client.get("/v1/me", headers=_bearer(test_env.secret))
    assert response.status_code == 200
    assert response.json()["api_key"]["environment"] == "test"


# ── Rejected ─────────────────────────────────────────────


def test_missing_key(client: TestClient) -> None:
    response = client.get("/v1/me")
    assert response.status_code == 401
    assert "Missing API key" in response.json()["detail"]
    assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "value",
    [
        "not-a-key",
        "sk_live",
        "sk_prod_abcd1234_secret",
        "pk_live_abcd1234_secret",
        "sk_live__secret",
        "sk_live_abcd1234_",
    ],
)
def test_malformed_key(client: TestClient, value: str) -> None:
    response = client.get("/v1/me", headers=_bearer(value))
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API key."


def test_unknown_key(client: TestClient) -> None:
    unknown = key_service.generate_key(ApiKeyEnvironment.live).key
    assert client.get("/v1/me", headers=_bearer(unknown)).status_code == 401


def test_right_prefix_wrong_secret(client: TestClient, live: Setup) -> None:
    forged = f"{live.key.prefix}_{'x' * 32}"
    response = client.get("/v1/me", headers=_bearer(forged))
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API key."


def test_revoked_key(client: TestClient, live: Setup) -> None:
    assert client.get("/v1/me", headers=_bearer(live.secret)).status_code == 200
    revoke = client.delete(
        f"/v1/api-keys/{live.key.id}",
        headers=_bearer(create_access_token(str(live.user.id), str(live.org.id))),
    )
    assert revoke.status_code == 204
    assert client.get("/v1/me", headers=_bearer(live.secret)).status_code == 401


def test_dashboard_token_is_not_an_api_key(client: TestClient, live: Setup) -> None:
    session = create_access_token(str(live.user.id), str(live.org.id))
    assert client.get("/v1/me", headers=_bearer(session)).status_code == 401


def test_api_key_is_not_a_dashboard_session(client: TestClient, live: Setup) -> None:
    assert client.get("/v1/api-keys", headers=_bearer(live.secret)).status_code == 401


# ── last_used_at ─────────────────────────────────────────


def test_first_use_sets_last_used(client: TestClient, live: Setup) -> None:
    assert _load_key(live.key.id).last_used_at is None
    client.get("/v1/me", headers=_bearer(live.secret))
    assert _load_key(live.key.id).last_used_at is not None


def test_last_used_is_throttled(client: TestClient, live: Setup) -> None:
    recent = datetime.now(UTC) - timedelta(seconds=10)
    _set_last_used(live.key.id, recent)
    client.get("/v1/me", headers=_bearer(live.secret))
    assert _load_key(live.key.id).last_used_at == recent


def test_last_used_refreshes_after_a_minute(client: TestClient, live: Setup) -> None:
    stale = datetime.now(UTC) - timedelta(minutes=5)
    _set_last_used(live.key.id, stale)
    client.get("/v1/me", headers=_bearer(live.secret))
    assert _load_key(live.key.id).last_used_at > stale + timedelta(minutes=4)


def test_last_used_shows_in_dashboard(client: TestClient, live: Setup) -> None:
    client.get("/v1/me", headers=_bearer(live.secret))
    session = create_access_token(str(live.user.id), str(live.org.id))
    listed = client.get("/v1/api-keys", headers=_bearer(session)).json()
    assert listed[0]["last_used_at"] is not None
