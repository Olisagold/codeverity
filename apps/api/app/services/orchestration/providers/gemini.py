import logging

import httpx

from app.services.orchestration.providers.base import Completion, ProviderError, post_json

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# 429 is rate limiting, 503 is "high demand", and the API also returns
# intermittent empty 404s. In each case the next model in the list may work.
FALL_THROUGH_STATUSES = {404, 429, 500, 502, 503, 504}

log = logging.getLogger("codeverity.orchestration")


class GeminiProvider:
    name = "gemini"

    def __init__(
        self,
        *,
        api_key: str,
        models: list[str],
        client: httpx.AsyncClient,
        effort: str,
        max_tokens: int,
    ):
        self.api_key = api_key
        self.models = models
        self.client = client
        self.effort = effort
        self.max_tokens = max_tokens

    async def complete(self, system: str, user: str) -> Completion:
        last_error = ProviderError("no Gemini models configured")
        for model in self.models:
            try:
                return await self._complete(model, system, user)
            except ProviderError as exc:
                if exc.status not in FALL_THROUGH_STATUSES:
                    raise
                log.info("gemini %s unavailable (%s), trying next model", model, exc.status)
                last_error = exc
        raise last_error

    async def _complete(self, model: str, system: str, user: str) -> Completion:
        data = await post_json(
            self.client,
            f"{BASE_URL}/{model}:generateContent",
            headers={"x-goog-api-key": self.api_key},
            body={
                "systemInstruction": {"parts": [{"text": system}]},
                "contents": [{"role": "user", "parts": [{"text": user}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "maxOutputTokens": self.max_tokens,
                    "thinkingConfig": {"thinkingLevel": self.effort},
                },
            },
        )
        try:
            parts = data["candidates"][0]["content"]["parts"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ProviderError("unexpected response shape") from exc
        text = "".join(part.get("text", "") for part in parts if not part.get("thought"))
        if not text:
            raise ProviderError("empty response")
        return Completion(provider=self.name, model=model, text=text)
