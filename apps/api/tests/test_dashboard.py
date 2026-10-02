"""Session-authenticated dashboard endpoints: session info, organization, assessments."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment, AssessmentStatus
from tests import test_usage as shared
from tests.test_usage import Org, _key, _run_db

# Same fixtures as the usage tests: an organization with a user and two keys.
client = shared.client
org = shared.org
other_org = shared.other_org


def test_session_returns_user_and_organization(client: TestClient, org: Org) -> None:
    body = client.get("/v1/dashboard/session", headers=org.session).json()
    assert body["user"]["email"] == org.user.email
    assert body["organization"]["id"] == str(org.user.organization_id)
    assert body["organization"]["members"] == [{"name": "Usage", "email": org.user.email}]


def test_update_organization(client: TestClient, org: Org, other_org: Org) -> None:
    response = client.patch(
        "/v1/dashboard/organization",
        headers=org.session,
        json={"name": " Acme ", "slug": "acme-x1"},
    )
    assert response.status_code == 200
    assert response.json()["organization"]["name"] == "Acme"
    assert response.json()["organization"]["slug"] == "acme-x1"

    taken = client.patch(
        "/v1/dashboard/organization", headers=other_org.session, json={"slug": "acme-x1"}
    )
    assert taken.status_code == 409
    bad = client.patch("/v1/dashboard/organization", headers=org.session, json={"slug": "Bad Slug"})
    assert bad.status_code == 422


def _add(org: Org, **values) -> str:
    async def _do(db) -> str:
        assessment = Assessment(
            organization_id=org.user.organization_id,
            environment=values.pop("environment", ApiKeyEnvironment.test),
            language=values.pop("language", "python"),
            assignment_title="Max",
            assignment_requirements="Return the max.",
            submission_code="max(xs)",
            **values,
        )
        db.add(assessment)
        await db.commit()
        return assessment.public_id

    return _run_db(_do)


def test_list_assessments_filters_and_pages(client: TestClient, org: Org) -> None:
    old = _add(org, created_at=datetime.now(UTC) - timedelta(days=10))
    failed = _add(org, status=AssessmentStatus.failed, language="java")
    live = _add(org, environment=ApiKeyEnvironment.live)

    def ids(**params) -> list[str]:
        body = client.get("/v1/dashboard/assessments", headers=org.session, params=params).json()
        return [a["id"] for a in body["data"]]

    assert ids() == [live, failed, old]
    assert ids(status="failed") == [failed]
    assert ids(language="Java") == [failed]
    assert ids(environment="live") == [live]
    assert ids(range="7d") == [live, failed]
    assert ids(q=failed[:20]) == [failed]

    page = client.get("/v1/dashboard/assessments", headers=org.session, params={"limit": 2}).json()
    assert page["languages"] == ["java", "python"]
    rest = client.get(
        "/v1/dashboard/assessments",
        headers=org.session,
        params={"limit": 2, "before": page["next_cursor"]},
    ).json()
    assert [a["id"] for a in rest["data"]] == [old]
    assert rest["next_cursor"] is None


def test_assessment_detail_maps_model_results(client: TestClient, org: Org) -> None:
    started = datetime.now(UTC) - timedelta(seconds=20)
    public_id = _add(
        org,
        status=AssessmentStatus.completed,
        score=8.0,
        confidence=0.9,
        started_at=started,
        completed_at=started + timedelta(seconds=12.5),
        criteria={"correctness": 8.0},
        feedback={"summary": "Good.", "issues": [], "suggestions": ["Test it."]},
        model_results=[
            {
                "provider": "openai",
                "model": "gpt-6-luna",
                "role": "assessment",
                "status": "completed",
                "latency_ms": 900,
                "feedback": {"summary": "Fine.", "issues": ["a"], "suggestions": []},
                "criteria": {"correctness": 9.0},
            },
            {"provider": "gemini", "role": "assessment", "status": "failed", "error": "timed out"},
            {"provider": "anthropic", "model": "claude-sonnet-5-5", "role": "review"},
        ],
    )
    body = client.get(f"/v1/dashboard/assessments/{public_id}", headers=org.session).json()
    assert body["processing_seconds"] == 12.5
    assert body["reviewer_model"] == "claude-sonnet-5-5"
    assert body["code"] == "max(xs)"
    openai, gemini = body["models"]
    assert (openai["summary"], openai["issues"], openai["criteria"]) == (
        "Fine.",
        ["a"],
        {"correctness": 9.0},
    )
    assert (gemini["status"], gemini["error"], gemini["issues"]) == ("failed", "timed out", [])


def test_assessments_are_scoped_to_organization(
    client: TestClient, org: Org, other_org: Org
) -> None:
    public_id = _add(org)
    path = f"/v1/dashboard/assessments/{public_id}"
    assert client.get(path, headers=other_org.session).status_code == 404
    listed = client.get("/v1/dashboard/assessments", headers=other_org.session).json()
    assert listed["data"] == []


@pytest.mark.parametrize("path", ["/v1/dashboard/session", "/v1/dashboard/assessments"])
def test_dashboard_requires_session(client: TestClient, org: Org, path: str) -> None:
    assert client.get(path).status_code == 401
    assert client.get(path, headers=_key(org.test)).status_code == 401
