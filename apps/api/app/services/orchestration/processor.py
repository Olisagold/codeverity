"""Turns a queued assessment into a result.

Phase 3 replaces the body of `process` with the real pipeline: ChatGPT, Gemini
and DeepSeek assess in parallel, then Claude reassesses. Until then:

- Test keys get a clearly labelled simulated result, so integrations can be
  built end to end (polling, result parsing, UI).
- Live keys fail with ORCHESTRATION_UNAVAILABLE, so no one ever receives a
  made-up grade on production traffic.
"""
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment
from app.services.assessments import Outcome, ProcessingError

SIMULATED_SUMMARY = (
    "Simulated result. Model assessment is not enabled yet, so this response only "
    "shows the shape of a real result. Scores and feedback are placeholders."
)


async def process(assessment: Assessment) -> Outcome:
    if assessment.environment != ApiKeyEnvironment.test:
        raise ProcessingError(
            "ORCHESTRATION_UNAVAILABLE",
            "Model assessment is not enabled yet. Use a test key to receive a simulated result.",
        )

    return Outcome(
        score=8.0,
        confidence=0.5,
        criteria={
            "correctness": 8.0,
            "relevance": 8.0,
            "actionability": 8.0,
            "specificity": 8.0,
            "pedagogical_fit": 8.0,
        },
        feedback={
            "summary": SIMULATED_SUMMARY,
            "issues": [],
            "suggestions": [f"Placeholder suggestion for {assessment.assignment_title}."],
            "simulated": True,
        },
    )
