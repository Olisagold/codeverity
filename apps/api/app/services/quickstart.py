"""Progress through the dashboard quickstart checklist for one organization.

Every step stays done once reached, so revoking the only key or deleting the
only webhook does not move the checklist backwards.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import exists, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import ApiKey
from app.models.assessment import Assessment, AssessmentStatus
from app.models.organization import Organization
from app.models.webhook import WebhookEndpoint
from app.schemas.dashboard import QuickstartOut


async def progress(db: AsyncSession, organization: Organization) -> QuickstartOut:
    org_id = organization.id

    async def _any(model, *where) -> bool:
        query = select(exists().where(model.organization_id == org_id, *where))
        return bool(await db.scalar(query))

    first_completed = await db.scalar(
        select(Assessment.public_id)
        .where(
            Assessment.organization_id == org_id,
            Assessment.status == AssessmentStatus.completed,
        )
        .order_by(Assessment.public_id)
        .limit(1)
    )
    return QuickstartOut(
        api_key=await _any(ApiKey),
        assessment=await _any(Assessment),
        webhook=await _any(WebhookEndpoint),
        result_viewed=organization.first_result_viewed_at is not None,
        first_completed_assessment_id=first_completed,
        dismissed=organization.quickstart_dismissed_at is not None,
    )


async def mark_result_viewed(db: AsyncSession, organization_id: uuid.UUID) -> None:
    """Record the first time anyone in the organization saw a finished result."""
    await db.execute(
        update(Organization)
        .where(Organization.id == organization_id, Organization.first_result_viewed_at.is_(None))
        .values(first_result_viewed_at=datetime.now(UTC))
    )
    await db.commit()


async def dismiss(db: AsyncSession, organization: Organization) -> None:
    if organization.quickstart_dismissed_at is None:
        organization.quickstart_dismissed_at = datetime.now(UTC)
        await db.commit()
