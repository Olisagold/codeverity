"""OpenAI and DeepSeek, which share the chat completions API."""
import httpx

from app.services.orchestration.providers.base import Completion, ProviderError, post_json

OPENAI_BASE_URL = "https://api.openai.com/v1"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"


class OpenAICompatibleProvider:
    def __init__(
        self, *, name: str, base_url: str, api_key: str, model: str, client: httpx.AsyncClient
    ):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        self.client = client

    async def complete(self, system: str, user: str) -> Completion:
        data = await post_json(
            self.client,
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            body={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "response_format": {"type": "json_object"},
            },
        )
        try:
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ProviderError("unexpected response shape") from exc
        if not text:
            raise ProviderError("empty response")
        return Completion(provider=self.name, model=data.get("model", self.model), text=text)
