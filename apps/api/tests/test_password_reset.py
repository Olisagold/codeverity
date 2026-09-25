"""Forgot-password and reset-password: single-use emailed token, no account
enumeration, and the new password actually works for login afterwards.

Emails are monkeypatched; Postgres and Redis are the real local ones, as in
`test_password_auth.py`.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

import app.api.v1.auth as auth_routes
from app.main import app
from tests.test_password_auth import _cleanup_user, _signup_payload


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def _mock_email(monkeypatch) -> tuple[list[str], list[str]]:
    """Returns (otp codes sent, reset tokens sent)."""
    otp_codes: list[str] = []
    reset_tokens: list[str] = []

    async def fake_send_otp_email(*, to: str, name: str, code: str) -> None:
        otp_codes.append(code)

    async def fake_send_welcome_email(*, to: str, name: str, organization: str) -> None:
        pass

    async def fake_send_password_reset_email(*, to: str, name: str, token: str) -> None:
        reset_tokens.append(token)

    monkeypatch.setattr(auth_routes, "send_otp_email", fake_send_otp_email)
    monkeypatch.setattr(auth_routes, "send_welcome_email", fake_send_welcome_email)
    monkeypatch.setattr(auth_routes, "send_password_reset_email", fake_send_password_reset_email)
    return otp_codes, reset_tokens


def _create_verified_user(client: TestClient, email: str, otp_codes: list[str]) -> None:
    assert client.post("/v1/auth/signup", json=_signup_payload(email)).status_code == 201
    verify = client.post("/v1/auth/verify-otp", json={"email": email, "code": otp_codes[-1]})
    assert verify.status_code == 200


def test_forgot_password_unknown_email_gives_same_response_and_sends_nothing(
    client, monkeypatch
) -> None:
    _, reset_tokens = _mock_email(monkeypatch)
    email = f"nobody-{uuid.uuid4().hex}@example.com"

    response = client.post("/v1/auth/forgot-password", json={"email": email})

    assert response.status_code == 200
    assert "reset link" in response.json()["message"]
    assert reset_tokens == []


def test_reset_password_rejects_unknown_token(client, monkeypatch) -> None:
    _mock_email(monkeypatch)
    response = client.post(
        "/v1/auth/reset-password", json={"token": "not-a-real-token", "password": "new-password-1"}
    )
    assert response.status_code == 400


def test_reset_password_enforces_minimum_length(client, monkeypatch) -> None:
    _mock_email(monkeypatch)
    response = client.post("/v1/auth/reset-password", json={"token": "x", "password": "short"})
    assert response.status_code == 422


def test_forgot_then_reset_then_login_with_new_password(client, monkeypatch) -> None:
    email = f"test-{uuid.uuid4().hex}@example.com"
    otp_codes, reset_tokens = _mock_email(monkeypatch)

    try:
        _create_verified_user(client, email, otp_codes)

        forgot = client.post("/v1/auth/forgot-password", json={"email": email})
        assert forgot.status_code == 200
        assert len(reset_tokens) == 1
        token = reset_tokens[0]

        reset = client.post(
            "/v1/auth/reset-password", json={"token": token, "password": "brand-new-password"}
        )
        assert reset.status_code == 200

        replay = client.post(
            "/v1/auth/reset-password", json={"token": token, "password": "another-password"}
        )
        assert replay.status_code == 400

        old_login = client.post(
            "/v1/auth/login", json={"email": email, "password": "correct-password"}
        )
        assert old_login.status_code == 401

        new_login = client.post(
            "/v1/auth/login", json={"email": email, "password": "brand-new-password"}
        )
        assert new_login.status_code == 200
        assert new_login.json()["access_token"]
    finally:
        _cleanup_user(email)


def test_new_reset_request_revokes_previous_token(client, monkeypatch) -> None:
    email = f"test-{uuid.uuid4().hex}@example.com"
    otp_codes, reset_tokens = _mock_email(monkeypatch)

    try:
        _create_verified_user(client, email, otp_codes)

        client.post("/v1/auth/forgot-password", json={"email": email})
        client.post("/v1/auth/forgot-password", json={"email": email})
        assert len(reset_tokens) == 2
        first, second = reset_tokens

        stale = client.post(
            "/v1/auth/reset-password", json={"token": first, "password": "brand-new-password"}
        )
        assert stale.status_code == 400

        fresh = client.post(
            "/v1/auth/reset-password", json={"token": second, "password": "brand-new-password"}
        )
        assert fresh.status_code == 200
    finally:
        _cleanup_user(email)


def test_reset_verifies_an_unverified_account(client, monkeypatch) -> None:
    """Someone who signed up but never entered the OTP can still recover via
    the emailed link, since following it proves they own the inbox.
    """
    email = f"test-{uuid.uuid4().hex}@example.com"
    _, reset_tokens = _mock_email(monkeypatch)

    try:
        assert client.post("/v1/auth/signup", json=_signup_payload(email)).status_code == 201

        client.post("/v1/auth/forgot-password", json={"email": email})
        assert len(reset_tokens) == 1

        reset = client.post(
            "/v1/auth/reset-password",
            json={"token": reset_tokens[0], "password": "brand-new-password"},
        )
        assert reset.status_code == 200

        login = client.post(
            "/v1/auth/login", json={"email": email, "password": "brand-new-password"}
        )
        assert login.status_code == 200
    finally:
        _cleanup_user(email)
