"""Email/password signup, OTP verification, and login.

`send_otp_email` is monkeypatched everywhere here; nothing in this file sends
a real email through Sendlib. Postgres and Redis are the real local ones from
docker-compose, since that's what `make api-test` runs against.
"""
import asyncio
import uuid
from collections.abc import Awaitable, Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.api.v1.auth as auth_routes
from app.core.config import get_settings
from app.main import app
from app.models.organization import Organization
from app.models.user import User


@pytest.fixture(scope="module")
def client():
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


def _mock_email(monkeypatch) -> list[str]:
    """Replaces send_otp_email; returns a list that receives each sent code."""
    sent_codes: list[str] = []

    async def fake_send_otp_email(*, to: str, name: str, code: str) -> None:
        sent_codes.append(code)

    monkeypatch.setattr(auth_routes, "send_otp_email", fake_send_otp_email)
    return sent_codes


def _signup_payload(email: str) -> dict:
    return {
        "name": "Test User",
        "organization": "Test Org",
        "email": email,
        "password": "correct-password",
    }


def test_signup_creates_unverified_user_and_sends_otp(client, monkeypatch) -> None:
    email = f"test-{uuid.uuid4().hex}@example.com"
    sent_codes = _mock_email(monkeypatch)

    try:
        response = client.post("/v1/auth/signup", json=_signup_payload(email))
        assert response.status_code == 201
        assert len(sent_codes) == 1
        assert len(sent_codes[0]) == 6

        async def _load_user(db: AsyncSession) -> User:
            return (await db.execute(select(User).where(User.email == email))).scalar_one()

        user = _run_db(_load_user)
        assert user.email_verified is False
        assert user.password_hash is not None
    finally:
        _cleanup_user(email)


def test_verify_otp_rejects_wrong_code(client, monkeypatch) -> None:
    email = f"test-{uuid.uuid4().hex}@example.com"
    _mock_email(monkeypatch)

    try:
        client.post("/v1/auth/signup", json=_signup_payload(email))
        response = client.post("/v1/auth/verify-otp", json={"email": email, "code": "000000"})
        assert response.status_code == 400
    finally:
        _cleanup_user(email)


def test_verify_otp_then_login_flow(client, monkeypatch) -> None:
    email = f"test-{uuid.uuid4().hex}@example.com"
    sent_codes = _mock_email(monkeypatch)

    try:
        client.post("/v1/auth/signup", json=_signup_payload(email))
        code = sent_codes[0]

        login_before_verify = client.post(
            "/v1/auth/login", json={"email": email, "password": "correct-password"}
        )
        assert login_before_verify.status_code == 403

        verify = client.post("/v1/auth/verify-otp", json={"email": email, "code": code})
        assert verify.status_code == 200
        assert verify.json()["access_token"]

        replay = client.post("/v1/auth/verify-otp", json={"email": email, "code": code})
        assert replay.status_code == 400

        login = client.post("/v1/auth/login", json={"email": email, "password": "correct-password"})
        assert login.status_code == 200
        assert login.json()["access_token"]

        wrong_password = client.post("/v1/auth/login", json={"email": email, "password": "nope"})
        assert wrong_password.status_code == 401
    finally:
        _cleanup_user(email)
