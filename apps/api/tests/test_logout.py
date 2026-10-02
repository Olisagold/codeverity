"""Sign-out revokes tokens server side."""

import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.services.auth import revocation
from tests import test_usage as shared
from tests.test_usage import Org

client = shared.client
org = shared.org


def _token(org: Org) -> str:
    return create_access_token(str(org.user.id), str(org.user.organization_id))


def _bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_tokens_have_unique_ids(org: Org) -> None:
    assert decode_token(_token(org))["jti"] != decode_token(_token(org))["jti"]


def test_logout_revokes_access_token(client: TestClient, org: Org) -> None:
    token = _token(org)
    assert client.get("/v1/dashboard/session", headers=_bearer(token)).status_code == 200

    assert client.post("/v1/auth/logout", headers=_bearer(token)).status_code == 204
    assert client.get("/v1/dashboard/session", headers=_bearer(token)).status_code == 401

    # Other sessions for the same user keep working.
    assert client.get("/v1/dashboard/session", headers=_bearer(_token(org))).status_code == 200


def test_logout_revokes_refresh_token(client: TestClient, org: Org) -> None:
    refresh = create_refresh_token(str(org.user.id))
    response = client.post("/v1/auth/logout", json={"refresh_token": refresh})
    assert response.status_code == 204

    async def _check() -> bool:
        return await revocation.is_revoked(decode_token(refresh))

    assert client.portal.call(_check) is True


@pytest.mark.parametrize(
    "kwargs",
    [{}, {"headers": _bearer("not-a-jwt")}, {"json": {"refresh_token": "garbage"}}],
    ids=["nothing", "bad-access", "bad-refresh"],
)
def test_logout_is_always_204(client: TestClient, kwargs: dict) -> None:
    assert client.post("/v1/auth/logout", **kwargs).status_code == 204


def test_tokens_without_id_still_work(client: TestClient, org: Org) -> None:
    # Sessions issued before token IDs existed keep working until they expire.
    now = int(time.time())
    legacy = jwt.encode(
        {
            "sub": str(org.user.id),
            "type": "access",
            "iat": now,
            "exp": now + 60,
            "org": str(org.user.organization_id),
        },
        get_settings().jwt_secret,
        algorithm="HS256",
    )
    assert client.get("/v1/dashboard/session", headers=_bearer(legacy)).status_code == 200
