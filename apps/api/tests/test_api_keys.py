"""API key management: create, list, get, revoke, and org isolation.

Runs against the real local Postgres from docker-compose, like the other auth
tests. Each test creates its own organization and user and removes them after.
"""

import asyncio
import uuid
from collections.abc import Awaitable, Callable, Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
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


def _make_user() -> User:
    suffix = uuid.uuid4().hex[:10]

    async def _do(db: AsyncSession) -> User:
        org = Organization(name=f"Org {suffix}", slug=f"org-{suffix}")
        db.add(org)
        await db.flush()
        user = User(
            email=f"keys-{suffix}@example.com",
            name="Key Tester",
            email_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        await db.commit()
        return user

    return _run_db(_do)


def _cleanup(user: User) -> None:
    async def _do(db: AsyncSession) -> None:
        await db.execute(delete(ApiKey).where(ApiKey.organization_id == user.organization_id))
        await db.execute(delete(User).where(User.id == user.id))
        await db.execute(delete(Organization).where(Organization.id == user.organization_id))
        await db.commit()

    _run_db(_do)


def _auth(user: User) -> dict[str, str]:
    token = create_access_token(str(user.id), str(user.organization_id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user() -> Iterator[User]:
    created = _make_user()
    yield created
    _cleanup(created)


@pytest.fixture
def other_user() -> Iterator[User]:
    created = _make_user()
    yield created
    _cleanup(created)


# ── Auth ─────────────────────────────────────────────────


def test_requires_session(client: TestClient) -> None:
    assert client.get("/v1/api-keys").status_code == 401
    assert client.post("/v1/api-keys", json={"name": "x"}).status_code == 401


def test_rejects_refresh_token(client: TestClient, user: User) -> None:
    headers = {"Authorization": f"Bearer {create_refresh_token(str(user.id))}"}
    assert client.get("/v1/api-keys", headers=headers).status_code == 401


def test_rejects_garbage_token(client: TestClient) -> None:
    headers = {"Authorization": "Bearer not-a-jwt"}
    assert client.get("/v1/api-keys", headers=headers).status_code == 401


# ── Create ───────────────────────────────────────────────


def test_create_returns_full_key_once(client: TestClient, user: User) -> None:
    response = client.post(
        "/v1/api-keys",
        headers=_auth(user),
        json={"name": " Production ", "environment": "live", "description": "Main app"},
    )
    assert response.status_code == 201
    body = response.json()

    key = body["key"]
    assert key.startswith("sk_live_")
    assert body["name"] == "Production"
    assert body["description"] == "Main app"
    assert body["environment"] == "live"
    assert body["active"] is True
    assert body["last_used_at"] is None
    assert body["masked"] == f"sk_live_••••••{key[-4:]}"

    # Only the hash is stored, never the key itself.
    stored = _run_db(lambda db: db.scalar(select(ApiKey).where(ApiKey.public_id == body["id"])))
    assert stored.key_hash == key_service.hash_key(key)
    assert stored.key_hash != key
    assert stored.prefix == key_service.parse_prefix(key)
    assert stored.created_by_id == user.id

    # Listing and fetching never include the secret.
    listed = client.get("/v1/api-keys", headers=_auth(user)).json()
    assert [item["id"] for item in listed] == [body["id"]]
    assert "key" not in listed[0]
    fetched = client.get(f"/v1/api-keys/{body['id']}", headers=_auth(user)).json()
    assert "key" not in fetched


def test_create_defaults_to_test_environment(client: TestClient, user: User) -> None:
    body = client.post("/v1/api-keys", headers=_auth(user), json={"name": "Dev"}).json()
    assert body["environment"] == "test"
    assert body["key"].startswith("sk_test_")


def test_create_validates_input(client: TestClient, user: User) -> None:
    headers = _auth(user)
    assert client.post("/v1/api-keys", headers=headers, json={"name": ""}).status_code == 422
    assert (
        client.post(
            "/v1/api-keys", headers=headers, json={"name": "x", "environment": "staging"}
        ).status_code
        == 422
    )


def test_keys_are_unique(client: TestClient, user: User) -> None:
    headers = _auth(user)
    a = client.post("/v1/api-keys", headers=headers, json={"name": "A"}).json()["key"]
    b = client.post("/v1/api-keys", headers=headers, json={"name": "B"}).json()["key"]
    assert a != b
    assert key_service.parse_prefix(a) != key_service.parse_prefix(b)


# ── Revoke ───────────────────────────────────────────────


def test_revoke_hides_key_and_is_idempotent(client: TestClient, user: User) -> None:
    headers = _auth(user)
    key_id = client.post("/v1/api-keys", headers=headers, json={"name": "Temp"}).json()["id"]

    assert client.delete(f"/v1/api-keys/{key_id}", headers=headers).status_code == 204
    assert client.get("/v1/api-keys", headers=headers).json() == []
    assert client.get(f"/v1/api-keys/{key_id}", headers=headers).json()["active"] is False
    assert client.delete(f"/v1/api-keys/{key_id}", headers=headers).status_code == 204


def test_unknown_key_is_404(client: TestClient, user: User) -> None:
    missing = uuid.uuid4()
    assert client.get(f"/v1/api-keys/{missing}", headers=_auth(user)).status_code == 404
    assert client.delete(f"/v1/api-keys/{missing}", headers=_auth(user)).status_code == 404


# ── Organization isolation ───────────────────────────────


def test_other_org_cannot_see_or_revoke(client: TestClient, user: User, other_user: User) -> None:
    key_id = client.post("/v1/api-keys", headers=_auth(user), json={"name": "Mine"}).json()["id"]

    outsider = _auth(other_user)
    assert client.get("/v1/api-keys", headers=outsider).json() == []
    assert client.get(f"/v1/api-keys/{key_id}", headers=outsider).status_code == 404
    assert client.delete(f"/v1/api-keys/{key_id}", headers=outsider).status_code == 404

    # Still active for its owner.
    assert client.get(f"/v1/api-keys/{key_id}", headers=_auth(user)).json()["active"] is True


# ── Key service ──────────────────────────────────────────


def test_generate_parse_and_match() -> None:
    generated = key_service.generate_key(ApiKeyEnvironment.live)
    assert key_service.parse_prefix(generated.key) == generated.prefix
    assert key_service.matches(generated.key, generated.key_hash)
    assert not key_service.matches(generated.key + "x", generated.key_hash)


@pytest.mark.parametrize(
    "value", ["", "sk_live", "sk_prod_abcd1234_secret", "pk_live_abcd1234_secret", "nonsense"]
)
def test_parse_prefix_rejects_malformed(value: str) -> None:
    assert key_service.parse_prefix(value) is None
