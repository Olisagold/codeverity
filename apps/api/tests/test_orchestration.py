"""Orchestration pipeline, with fake providers and reviewer. No network calls."""

import asyncio
import json

import httpx
import pytest

from app.core.config import get_settings
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment
from app.services.assessments import ProcessingError
from app.services.orchestration import processor, prompts, providers, reviewer
from app.services.orchestration.providers.base import Completion, ProviderError
from app.services.orchestration.providers.gemini import GeminiProvider

FEEDBACK = {"summary": "Works.", "issues": [], "suggestions": ["Handle an empty list."]}
SCORES = dict.fromkeys(prompts.CRITERIA, 9.0)


def _assessment() -> Assessment:
    return Assessment(
        public_id="asm_test",
        environment=ApiKeyEnvironment.live,
        language="python",
        assignment_title="Max",
        assignment_requirements="Return the largest number.",
        submission_code="def find_max(xs):\n    return max(xs)\n",
    )


class FakeProvider:
    def __init__(self, name: str, *, fail: bool = False, text: str = json.dumps(FEEDBACK)):
        self.name = name
        self.fail = fail
        self.text = text

    async def complete(self, system: str, user: str) -> Completion:
        if self.fail:
            raise ProviderError("HTTP 429", status=429)
        return Completion(provider=self.name, model=f"{self.name}-model", text=self.text)


@pytest.fixture
def configured(monkeypatch: pytest.MonkeyPatch):
    settings = get_settings().model_copy(update={"anthropic_api_key": "x", "min_model_results": 2})
    monkeypatch.setattr(processor, "get_settings", lambda: settings)

    def use(fakes: list[FakeProvider]) -> None:
        monkeypatch.setattr(providers, "configured", lambda _s, _c: fakes)

    return use


@pytest.fixture
def fake_review(monkeypatch: pytest.MonkeyPatch) -> list:
    calls = []

    async def _review(assessment, candidates):
        calls.append(candidates)
        return reviewer.Review(
            model="claude-test",
            candidate_criteria=[SCORES] * len(candidates),
            agreement=0.8,
            feedback=FEEDBACK,
            criteria=SCORES,
        )

    monkeypatch.setattr(reviewer, "review", _review)
    return calls


def test_pipeline_combines_models_and_review(configured, fake_review) -> None:
    configured([FakeProvider("openai"), FakeProvider("gemini"), FakeProvider("deepseek")])
    outcome = asyncio.run(processor.process(_assessment()))

    assert outcome.score == 9.0
    assert outcome.confidence == round(0.5 * 0.8 + 0.05 * 9.0, 2)
    assert outcome.feedback == FEEDBACK
    assert len(fake_review[0]) == 3
    assessed = [r for r in outcome.model_results if r["role"] == "assessment"]
    assert [r["provider"] for r in assessed] == ["openai", "gemini", "deepseek"]
    assert all(r["criteria"] == SCORES for r in assessed)


def test_pipeline_tolerates_one_failed_model(configured, fake_review) -> None:
    configured(
        [FakeProvider("openai"), FakeProvider("gemini", fail=True), FakeProvider("deepseek")]
    )
    outcome = asyncio.run(processor.process(_assessment()))

    assert len(fake_review[0]) == 2
    failed = [r for r in outcome.model_results if r.get("status") == "failed"]
    assert [r["provider"] for r in failed] == ["gemini"]


def test_pipeline_fails_when_too_few_models_succeed(configured, fake_review) -> None:
    configured(
        [
            FakeProvider("openai", text="not json"),
            FakeProvider("gemini", fail=True),
            FakeProvider("deepseek"),
        ]
    )
    with pytest.raises(ProcessingError) as exc:
        asyncio.run(processor.process(_assessment()))
    assert exc.value.code == "MODELS_UNAVAILABLE"
    assert fake_review == []


def test_pipeline_reports_review_failure(configured, monkeypatch: pytest.MonkeyPatch) -> None:
    configured([FakeProvider("openai"), FakeProvider("deepseek")])

    async def _review(assessment, candidates):
        raise reviewer.ReviewError("refused")

    monkeypatch.setattr(reviewer, "review", _review)
    with pytest.raises(ProcessingError) as exc:
        asyncio.run(processor.process(_assessment()))
    assert exc.value.code == "REVIEW_FAILED"


def _gemini(handler) -> GeminiProvider:
    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return GeminiProvider(
        api_key="k", models=["big", "small"], client=client, effort="low", max_tokens=100
    )


def _gemini_ok(text: str) -> httpx.Response:
    return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})


def test_gemini_falls_back_when_rate_limited() -> None:
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.url.path)
        if "big" in request.url.path:
            return httpx.Response(429, json={"error": {"code": 429}})
        return _gemini_ok("{}")

    completion = asyncio.run(_gemini(handler).complete("s", "u"))
    assert completion.model == "small"
    assert len(seen) == 2


def test_gemini_raises_after_last_model() -> None:
    provider = _gemini(lambda request: httpx.Response(429))
    with pytest.raises(ProviderError) as exc:
        asyncio.run(provider.complete("s", "u"))
    assert exc.value.status == 429


def test_gemini_does_not_fall_back_on_bad_request() -> None:
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.url.path)
        return httpx.Response(400)

    with pytest.raises(ProviderError):
        asyncio.run(_gemini(handler).complete("s", "u"))
    assert len(seen) == 1


def test_parse_feedback_accepts_fenced_json() -> None:
    parsed = prompts.parse_feedback('```json\n{"summary": " ok ", "issues": ["a"]}\n```')
    assert parsed == {"summary": "ok", "issues": ["a"], "suggestions": []}


def test_parse_feedback_rejects_missing_summary() -> None:
    with pytest.raises(ValueError):
        prompts.parse_feedback('{"issues": []}')


def test_clamp_scores_bounds_values() -> None:
    raw = {**SCORES, "correctness": 14, "relevance": -2}
    clamped = prompts.clamp_scores(raw)
    assert clamped["correctness"] == 10.0
    assert clamped["relevance"] == 0.0
