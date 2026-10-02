"""Dashboard endpoints for managing an organization's webhook endpoints.

Authenticated with the dashboard session, scoped to the caller's organization.
The signing secret is returned on creation and rotation only.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.webhook import WebhookDelivery, WebhookEndpoint
from app.schemas.webhooks import (
    DeliveryOut,
    WebhookCreate,
    WebhookOut,
    WebhookUpdate,
    WebhookWithSecret,
)
from app.services import webhooks

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _to_out(endpoint: WebhookEndpoint, last_delivery_at=None) -> WebhookOut:
    return WebhookOut(
        last_delivery_at=last_delivery_at,
        id=endpoint.id,
        url=endpoint.url,
        environment=endpoint.environment,
        description=endpoint.description,
        events=endpoint.events,
        active=endpoint.active,
        created_at=endpoint.created_at,
    )


def _with_secret(endpoint: WebhookEndpoint) -> WebhookWithSecret:
    return WebhookWithSecret(**_to_out(endpoint).model_dump(), secret=endpoint.secret)


def _delivery_out(delivery: WebhookDelivery) -> DeliveryOut:
    return DeliveryOut.model_validate(delivery, from_attributes=True)


def _bad_url(exc: webhooks.InvalidWebhookUrl) -> HTTPException:
    return HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))


async def _owned_or_404(db: AsyncSession, endpoint_id: uuid.UUID, user: User) -> WebhookEndpoint:
    try:
        return await webhooks.get_owned(db, endpoint_id, user.organization_id)
    except webhooks.WebhookNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Webhook not found.") from exc


@router.get("", response_model=list[WebhookOut])
async def list_webhooks(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[WebhookOut]:
    endpoints = await webhooks.list_endpoints(db, user.organization_id)
    last = await webhooks.last_delivery_times(db, [e.id for e in endpoints])
    return [_to_out(e, last.get(e.id)) for e in endpoints]


@router.post("", response_model=WebhookWithSecret, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    body: WebhookCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookWithSecret:
    try:
        endpoint = await webhooks.create_endpoint(
            db,
            organization_id=user.organization_id,
            url=body.url,
            environment=body.environment,
            events=body.events,
            description=body.description,
        )
    except webhooks.InvalidWebhookUrl as exc:
        raise _bad_url(exc) from exc
    except webhooks.WebhookLimitReached as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"An organization can have at most {webhooks.MAX_ENDPOINTS} webhooks.",
        ) from exc
    return _with_secret(endpoint)


@router.get("/{endpoint_id}", response_model=WebhookOut)
async def get_webhook(
    endpoint_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookOut:
    endpoint = await _owned_or_404(db, endpoint_id, user)
    last = await webhooks.last_delivery_times(db, [endpoint.id])
    return _to_out(endpoint, last.get(endpoint.id))


@router.patch("/{endpoint_id}", response_model=WebhookOut)
async def update_webhook(
    endpoint_id: uuid.UUID,
    body: WebhookUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookOut:
    endpoint = await _owned_or_404(db, endpoint_id, user)
    try:
        endpoint = await webhooks.update_endpoint(
            db, endpoint, **body.model_dump(exclude_unset=True)
        )
    except webhooks.InvalidWebhookUrl as exc:
        raise _bad_url(exc) from exc
    return _to_out(endpoint)


@router.delete("/{endpoint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    endpoint_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    await webhooks.delete_endpoint(db, await _owned_or_404(db, endpoint_id, user))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{endpoint_id}/rotate-secret", response_model=WebhookWithSecret)
async def rotate_webhook_secret(
    endpoint_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookWithSecret:
    """Replace the signing secret. The old one stops working immediately."""
    endpoint = await _owned_or_404(db, endpoint_id, user)
    return _with_secret(await webhooks.rotate_secret(db, endpoint))


@router.post("/{endpoint_id}/test", response_model=DeliveryOut, status_code=202)
async def send_test_event(
    endpoint_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DeliveryOut:
    """Queue a `webhook.test` event for this endpoint."""
    endpoint = await _owned_or_404(db, endpoint_id, user)
    return _delivery_out(await webhooks.send_test(db, endpoint))


@router.get("/{endpoint_id}/deliveries", response_model=list[DeliveryOut])
async def list_deliveries(
    endpoint_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DeliveryOut]:
    """The 50 most recent deliveries, newest first."""
    endpoint = await _owned_or_404(db, endpoint_id, user)
    return [_delivery_out(d) for d in await webhooks.recent_deliveries(db, endpoint)]
