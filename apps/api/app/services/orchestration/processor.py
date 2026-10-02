"""Turns a queued assessment into a result.

Live keys run the real pipeline: the configured assessor models (OpenAI,
Gemini, DeepSeek) write feedback in parallel, then Claude reviews it and
produces the final result. Test keys get a clearly labelled simulated result,
so integrations can be built end to end without spending model credits.
"""

import asyncio
import logging
import time

import httpx

from app.core.config import get_settings
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment
from app.services.assessments import Outcome, ProcessingError
from app.services.orchestration import prompts, providers, reviewer
from app.services.orchestration.providers.base import Provider, ProviderError

log = logging.getLogger("codeverity.orchestration")

SIMULATED_SUMMARY = (
    "Simulated result. Test keys do not call the models, so this response only "
    "shows the shape of a real result. Scores and feedback are placeholders."
)


async def process(assessment: Assessment) -> Outcome:
    if assessment.environment == ApiKeyEnvironment.test:
        return _simulated(assessment)

    settings = get_settings()
    async with httpx.AsyncClient(timeout=settings.model_timeout_seconds) as client:
        assessors = providers.configured(settings, client)
        if len(assessors) < settings.min_model_results or not settings.anthropic_api_key:
            raise ProcessingError(
                "ORCHESTRATION_UNAVAILABLE",
                "Model assessment is not configured yet. Use a test key to receive a "
                "simulated result.",
            )
        prompt = prompts.assessor_prompt(assessment)
        results = await asyncio.gather(*(_assess(p, prompt) for p in assessors))

    succeeded = [r for r in results if r["status"] == "completed"]
    if len(succeeded) < settings.min_model_results:
        raise ProcessingError(
            "MODELS_UNAVAILABLE",
            "Not enough models returned an assessment. Please submit it again later.",
        )

    try:
        verdict = await reviewer.review(assessment, [r["feedback"] for r in succeeded])
    except reviewer.ReviewError as exc:
        log.warning("review failed for %s: %s", assessment.public_id, exc)
        raise ProcessingError(
            "REVIEW_FAILED", "The final review could not be completed. Please try again."
        ) from exc

    for result, criteria in zip(succeeded, verdict.candidate_criteria, strict=True):
        result["criteria"] = criteria

    score = round(sum(verdict.criteria.values()) / len(verdict.criteria), 1)
    return Outcome(
        score=score,
        confidence=round(0.5 * verdict.agreement + 0.05 * score, 2),
        criteria=verdict.criteria,
        feedback=verdict.feedback,
        model_results=[
            *results,
            {"provider": "anthropic", "model": verdict.model, "role": "review"},
        ],
    )


async def _assess(provider: Provider, prompt: str) -> dict:
    started = time.monotonic()
    result: dict = {"provider": provider.name, "role": "assessment"}
    try:
        completion = await provider.complete(prompts.ASSESSOR_SYSTEM, prompt)
        result["model"] = completion.model
        result["feedback"] = prompts.parse_feedback(completion.text)
        result["status"] = "completed"
    except ProviderError as exc:
        log.warning("%s failed: %s", provider.name, exc)
        result.update(status="failed", error=str(exc)[:300])
    except ValueError as exc:
        log.warning("%s returned unusable output: %s", provider.name, exc)
        result.update(status="failed", error="unusable output")
    result["latency_ms"] = round((time.monotonic() - started) * 1000)
    return result


def _simulated(assessment: Assessment) -> Outcome:
    return Outcome(
        score=8.0,
        confidence=0.5,
        criteria=dict.fromkeys(prompts.CRITERIA, 8.0),
        feedback={
            "summary": SIMULATED_SUMMARY,
            "issues": [],
            "suggestions": [f"Placeholder suggestion for {assessment.assignment_title}."],
            "simulated": True,
        },
    )
