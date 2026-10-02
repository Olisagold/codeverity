"""Claude's review pass: scores each model's feedback and writes the final result."""

import json
from dataclasses import dataclass

import anthropic

from app.core.config import get_settings
from app.models.assessment import Assessment
from app.services.orchestration import prompts


class ReviewError(Exception):
    pass


@dataclass
class Review:
    model: str
    candidate_criteria: list[dict[str, float] | None]
    agreement: float
    feedback: dict
    criteria: dict[str, float]


async def review(assessment: Assessment, candidates: list[dict]) -> Review:
    settings = get_settings()
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key, timeout=settings.model_timeout_seconds * 2
    )
    try:
        response = await client.beta.messages.create(
            model=settings.anthropic_model,
            max_tokens=8000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={
                "effort": settings.reviewer_effort,
                "format": {"type": "json_schema", "schema": prompts.REVIEW_SCHEMA},
            },
            system=prompts.REVIEWER_SYSTEM,
            messages=[{"role": "user", "content": prompts.reviewer_prompt(assessment, candidates)}],
        )
    except anthropic.APIError as exc:
        raise ReviewError(f"Claude request failed: {type(exc).__name__}") from exc
    finally:
        await client.close()

    if response.stop_reason == "refusal":
        raise ReviewError("Claude declined to review this submission")
    if response.stop_reason == "max_tokens":
        raise ReviewError("Claude's review was cut off")

    try:
        text = next(block.text for block in response.content if block.type == "text")
        data = json.loads(text)
        per_candidate: list[dict[str, float] | None] = [None] * len(candidates)
        for item in data["candidates"]:
            if 0 <= item["index"] < len(candidates):
                per_candidate[item["index"]] = prompts.clamp_scores(item["criteria"])
        return Review(
            model=response.model,
            candidate_criteria=per_candidate,
            agreement=min(max(float(data["agreement"]), 0.0), 1.0),
            feedback=data["feedback"],
            criteria=prompts.clamp_scores(data["criteria"]),
        )
    except (StopIteration, ValueError, KeyError, TypeError) as exc:
        raise ReviewError("Claude returned an unexpected review format") from exc
