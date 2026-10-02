import asyncio
from dataclasses import dataclass
from typing import Protocol

import httpx

RETRYABLE_STATUSES = {500, 502, 503, 504}


class ProviderError(Exception):
    def __init__(self, message: str, *, status: int | None = None):
        super().__init__(message)
        self.status = status


@dataclass
class Completion:
    provider: str
    model: str
    text: str


class Provider(Protocol):
    name: str

    async def complete(self, system: str, user: str) -> Completion: ...


async def post_json(client: httpx.AsyncClient, url: str, *, headers: dict, body: dict) -> dict:
    """POST and return the JSON body. Retries a server error once; raises ProviderError."""
    for attempt in range(2):
        try:
            response = await client.post(url, headers=headers, json=body)
        except httpx.TimeoutException as exc:
            raise ProviderError("timed out") from exc
        except httpx.HTTPError as exc:
            raise ProviderError(f"request failed: {type(exc).__name__}") from exc

        if response.status_code in RETRYABLE_STATUSES and attempt == 0:
            await asyncio.sleep(1)
            continue
        if response.status_code >= 400:
            raise ProviderError(
                f"HTTP {response.status_code}: {response.text[:200]}",
                status=response.status_code,
            )
        return response.json()
    raise AssertionError("unreachable")
