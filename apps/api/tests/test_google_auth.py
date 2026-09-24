"""Google sign-in: the login redirect, state validation, user/org creation on
first sign-in, and the one-time exchange code.

`fetch_profile` (the actual call to Google) is monkeypatched everywhere here;
nothing in this file talks to the real Google API. Postgres and Redis are the
real local ones from docker-compose, since that's what `make api-test` runs
against.
"""
import asyncio
import uuid
from collections.abc import Awaitable, Callable
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.api.v1.auth as auth_routes
from app.core.config import get_settings
from app.main import app
from app.models.organization import Organization
from app.models.user import User
from app.services.auth.google import GoogleProfile


@pytest.fixture(scope="module")
def client():
    # Entering as a context manager keeps one event loop alive for every
    # request made through it. Without it, each call gets its own loop, and
    # the pooled asyncpg/Redis connections (bound to the first loop) break on
    # the second request.
    with TestClient(app, follow_redirects=False) as test_client:
        yield test_client


def _query_param(url: str, name: str) -> str:
    return parse_qs(urlparse(url).query)[name][0]


def _run_db[T](fn: Callable[[AsyncSession], Awaitable[T]]) -> T:
    """Run one query against a throwaway engine, in its own event loop.

    Kept separate from the app's pooled engine (which is bound to the
    TestClient's own event loop) so this never touches a connection from a
    different loop.
    """

    async def _inner() -> T:
        engine = create_async_engine(get_settings().async_database_url)
        try:
            session_factory = async_sessionmaker(engine, expire_on_commit=False)
            async with session_factory() as db:
                return await fn(db)
        finally:
            await engine.dispose()

    return asyncio.run(_inner())


def _cleanup_user(email: str) -> None:
    async def _do(db: AsyncSession) -> None:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if user is None:
            return
        org_id = user.organization_id
        await db.delete(user)
        await db.execute(delete(Organization).where(Organization.id == org_id))
        await db.commit()

    _run_db(_do)


def _fake_profile(monkeypatch, profile: GoogleProfile) -> None:
    async def fake_fetch_profile(code: str) -> GoogleProfile:
        return profile

    monkeypatch.setattr(auth_routes, "fetch_profile", fake_fetch_profile)


def _new_profile() -> GoogleProfile:
    return GoogleProfile(
        sub=f"google-{uuid.uuid4().hex}",
        email=f"test-{uuid.uuid4().hex}@example.com",
        email_verified=True,
        name="Test User",
    )


def _get_state(client) -> str:
    return _query_param(client.get("/v1/auth/google/login").headers["location"], "state")


def _do_callback(client, state: str):
    return client.get("/v1/auth/google/callback", params={"code": "fake-code", "state": state})


def test_google_login_redirects_to_google(client) -> None:
    response = client.get("/v1/auth/google/login")
    assert response.status_code == 307
    location = response.headers["location"]
    assert location.startswith("https://accounts.google.com/o/oauth2/v2/auth")
    assert _query_param(location, "state")


def test_google_callback_rejects_unknown_state(client) -> None:
    response = _do_callback(client, state="not-a-real-state")
    assert response.status_code == 400


def test_first_time_google_signup_creates_org_and_issues_tokens(client, monkeypatch) -> None:
    profile = _new_profile()
    email = profile.email
    _fake_profile(monkeypatch, profile)

    try:
        callback = _do_callback(client, _get_state(client))
        assert callback.status_code == 307
        callback_location = callback.headers["location"]
        assert callback_location.startswith("http://localhost:3000/auth/callback")
        exchange_code = _query_param(callback_location, "code")

        exchange = client.post("/v1/auth/exchange", json={"code": exchange_code})
        assert exchange.status_code == 200
        body = exchange.json()
        assert body["access_token"]
        assert body["refresh_token"]

        # The code is one-time use.
        replay = client.post("/v1/auth/exchange", json={"code": exchange_code})
        assert replay.status_code == 400

        async def _load_user(db: AsyncSession) -> User:
            return (await db.execute(select(User).where(User.email == email))).scalar_one()

        user = _run_db(_load_user)
        assert user.google_sub == profile.sub
        assert user.role.value == "owner"
    finally:
        _cleanup_user(email)


def test_returning_google_user_logs_in_without_a_new_org(client, monkeypatch) -> None:
    profile = _new_profile()
    email = profile.email
    _fake_profile(monkeypatch, profile)

    try:
        for _ in range(2):
            callback = _do_callback(client, _get_state(client))
            assert callback.status_code == 307

        async def _count_users(db: AsyncSession) -> int:
            rows = (await db.execute(select(User).where(User.email == email))).scalars().all()
            return len(rows)

        assert _run_db(_count_users) == 1
    finally:
        _cleanup_user(email)
