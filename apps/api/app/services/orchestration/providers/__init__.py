"""LLM provider adapters.

Each provider (OpenAI, Gemini, DeepSeek) implements the same interface
(`base.py`) so the orchestrator can call an arbitrary set of models without
knowing which providers are behind them.
"""
import httpx

from app.core.config import Settings
from app.services.orchestration.providers.base import Provider
from app.services.orchestration.providers.gemini import GeminiProvider
from app.services.orchestration.providers.openai_compatible import (
    DEEPSEEK_BASE_URL,
    OPENAI_BASE_URL,
    OpenAICompatibleProvider,
)


def configured(settings: Settings, client: httpx.AsyncClient) -> list[Provider]:
    """The assessor providers that have an API key set."""
    providers: list[Provider] = []
    if settings.openai_api_key:
        providers.append(
            OpenAICompatibleProvider(
                name="openai",
                base_url=OPENAI_BASE_URL,
                api_key=settings.openai_api_key,
                model=settings.openai_model,
                client=client,
                options={
                    "reasoning_effort": settings.assessor_effort,
                    "max_completion_tokens": settings.assessor_max_tokens,
                },
            )
        )
    if settings.gemini_api_key and settings.gemini_model_list:
        providers.append(
            GeminiProvider(
                api_key=settings.gemini_api_key,
                models=settings.gemini_model_list,
                client=client,
                effort=settings.assessor_effort,
                max_tokens=settings.assessor_max_tokens,
            )
        )
    if settings.deepseek_api_key:
        providers.append(
            OpenAICompatibleProvider(
                name="deepseek",
                base_url=DEEPSEEK_BASE_URL,
                api_key=settings.deepseek_api_key,
                model=settings.deepseek_model,
                client=client,
                options={
                    "reasoning_effort": settings.assessor_effort,
                    "max_tokens": settings.assessor_max_tokens,
                },
            )
        )
    return providers
