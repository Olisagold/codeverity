"""`GET /v1/me`: confirm an API key works and see which organization it belongs to."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ApiCaller, get_api_caller, get_db
from app.models.organization import Organization
from app.schemas.me import MeApiKey, MeOrganization, MeResponse
from app.services import api_keys as keys

router = APIRouter(tags=["me"])


@router.get("/me", response_model=MeResponse)
async def me(
    caller: ApiCaller = Depends(get_api_caller), db: AsyncSession = Depends(get_db)
) -> MeResponse:
    organization = await db.get(Organization, caller.organization_id)
    api_key = caller.api_key
    return MeResponse(
        organization=MeOrganization(
            id=organization.id, name=organization.name, slug=organization.slug
        ),
        api_key=MeApiKey(
            id=api_key.id,
            name=api_key.name,
            environment=api_key.environment,
            masked=keys.mask(api_key.environment, api_key.last_four),
        ),
    )
