
from pydantic import BaseModel

from app.models.api_key import ApiKeyEnvironment


class MeOrganization(BaseModel):
    id: str
    name: str
    slug: str


class MeApiKey(BaseModel):
    id: str
    name: str
    environment: ApiKeyEnvironment
    masked: str


class MeResponse(BaseModel):
    """Who the API key belongs to. Useful for checking a key works."""

    organization: MeOrganization
    api_key: MeApiKey
