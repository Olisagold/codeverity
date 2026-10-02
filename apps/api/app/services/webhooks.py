"""Webhooks: endpoint management, event enqueueing, signing, and delivery.

Events are written to `webhook_deliveries` in the same transaction that
finishes the assessment, so an event can't be lost between the two. The worker
then claims due deliveries (`FOR UPDATE SKIP LOCKED`) and POSTs them.

Each request carries `Codeverity-Signature: t=<unix time>,v1=<hex>`, where the
hex is HMAC-SHA256 of `"<t>.<raw body>"` keyed with the endpoint's secret.
"""

import asyncio
import hashlib
import hmac
import ipaddress
import json
import secrets
import time
import uuid
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.ids import new_id
from app.models.api_key import ApiKeyEnvironment
from app.models.assessment import Assessment
from app.models.webhook import DeliveryStatus, WebhookDelivery, WebhookEndpoint
from app.schemas.assessments import AssessmentResult

MAX_ENDPOINTS = 10
DELIVERY_TIMEOUT_SECONDS = 10
# Wait before each retry. After the last one fails, the delivery is marked failed.
RETRY_DELAYS = [
    timedelta(minutes=1),
    timedelta(minutes=5),
    timedelta(minutes=30),
    timedelta(hours=2),
    timedelta(hours=6),
]
MAX_ATTEMPTS = len(RETRY_DELAYS) + 1
TEST_EVENT = "webhook.test"


class WebhookNotFound(Exception):
    pass


class WebhookLimitReached(Exception):
    pass


class InvalidWebhookUrl(Exception):
    pass


# ── Endpoints ─────────────────────────────────────────────


def _is_development() -> bool:
    return get_settings().environment == "development"


def validate_url(url: str) -> str:
    """Reject URLs that could point the worker at our own network.

    Plain http and local hosts are allowed in development only, so you can
    point a webhook at a local server while building an integration.
    """
    url = url.strip()
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise InvalidWebhookUrl("Use a full URL, such as https://example.com/webhooks.")
    if parts.username or parts.password:
        raise InvalidWebhookUrl("Webhook URLs can't contain credentials.")
    if _is_development():
        return url
    if parts.scheme != "https":
        raise InvalidWebhookUrl("Webhook URLs must use https.")
    host = parts.hostname.lower()
    if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
        raise InvalidWebhookUrl("Webhook URLs must be publicly reachable.")
    try:
        if not ipaddress.ip_address(host).is_global:
            raise InvalidWebhookUrl("Webhook URLs must be publicly reachable.")
    except ValueError:
        pass
    return url


def _new_secret() -> str:
    return f"whsec_{secrets.token_urlsafe(24)}"


async def list_endpoints(db: AsyncSession, organization_id: uuid.UUID) -> list[WebhookEndpoint]:
    result = await db.scalars(
        select(WebhookEndpoint)
        .where(WebhookEndpoint.organization_id == organization_id)
        .order_by(WebhookEndpoint.created_at.desc())
    )
    return list(result)


async def create_endpoint(
    db: AsyncSession,
    *,
    organization_id: uuid.UUID,
    url: str,
    environment: ApiKeyEnvironment,
    events: list[str],
    description: str | None,
) -> WebhookEndpoint:
    count = await db.scalar(
        select(func.count())
        .select_from(WebhookEndpoint)
        .where(WebhookEndpoint.organization_id == organization_id)
    )
    if (count or 0) >= MAX_ENDPOINTS:
        raise WebhookLimitReached
    endpoint = WebhookEndpoint(
        organization_id=organization_id,
        environment=environment,
        url=validate_url(url),
        description=(description or "").strip() or None,
        events=sorted(set(events)),
        secret=_new_secret(),
    )
    db.add(endpoint)
    await db.commit()
    await db.refresh(endpoint)
    return endpoint


async def get_owned(
    db: AsyncSession, endpoint_id: uuid.UUID, organization_id: uuid.UUID
) -> WebhookEndpoint:
    endpoint = await db.get(WebhookEndpoint, endpoint_id)
    if endpoint is None or endpoint.organization_id != organization_id:
        raise WebhookNotFound
    return endpoint


async def update_endpoint(
    db: AsyncSession,
    endpoint: WebhookEndpoint,
    *,
    url: str | None = None,
    description: str | None = None,
    events: list[str] | None = None,
    active: bool | None = None,
) -> WebhookEndpoint:
    if url is not None:
        endpoint.url = validate_url(url)
    if description is not None:
        endpoint.description = description.strip() or None
    if events is not None:
        endpoint.events = sorted(set(events))
    if active is not None:
        endpoint.disabled_at = None if active else (endpoint.disabled_at or datetime.now(UTC))
    await db.commit()
    await db.refresh(endpoint)
    return endpoint


async def rotate_secret(db: AsyncSession, endpoint: WebhookEndpoint) -> WebhookEndpoint:
    endpoint.secret = _new_secret()
    await db.commit()
    await db.refresh(endpoint)
    return endpoint


async def delete_endpoint(db: AsyncSession, endpoint: WebhookEndpoint) -> None:
    await db.delete(endpoint)
    await db.commit()


async def recent_deliveries(
    db: AsyncSession, endpoint: WebhookEndpoint, limit: int = 50
) -> list[WebhookDelivery]:
    result = await db.scalars(
        select(WebhookDelivery)
        .where(WebhookDelivery.endpoint_id == endpoint.id)
        .order_by(WebhookDelivery.created_at.desc())
        .limit(limit)
    )
    return list(result)


# ── Events ────────────────────────────────────────────────


def _event(event_type: str, data: dict) -> dict:
    return {
        "id": new_id("evt"),
        "type": event_type,
        "created_at": datetime.now(UTC).isoformat(),
        "data": data,
    }


def assessment_event(event_type: str, assessment: Assessment) -> dict:
    if event_type == "assessment.completed":
        data = AssessmentResult.from_assessment(assessment).model_dump(mode="json")
    else:
        data = {
            "assessment_id": assessment.public_id,
            "status": assessment.status.value,
            "error": {"code": assessment.error_code, "message": assessment.error_message},
        }
    return _event(event_type, data)


async def enqueue(db: AsyncSession, assessment: Assessment, event_type: str) -> None:
    """Queue `event_type` for every subscribed endpoint. The caller commits."""
    endpoints = await db.scalars(
        select(WebhookEndpoint).where(
            WebhookEndpoint.organization_id == assessment.organization_id,
            WebhookEndpoint.environment == assessment.environment,
            WebhookEndpoint.disabled_at.is_(None),
        )
    )
    subscribed = [e for e in endpoints if event_type in e.events]
    if not subscribed:
        return
    event = assessment_event(event_type, assessment)
    for endpoint in subscribed:
        db.add(
            WebhookDelivery(
                endpoint_id=endpoint.id,
                event_id=event["id"],
                event_type=event_type,
                payload=event,
            )
        )


async def send_test(db: AsyncSession, endpoint: WebhookEndpoint) -> WebhookDelivery:
    event = _event(TEST_EVENT, {"message": "Test event from Codeverity."})
    delivery = WebhookDelivery(
        endpoint_id=endpoint.id, event_id=event["id"], event_type=TEST_EVENT, payload=event
    )
    db.add(delivery)
    await db.commit()
    await db.refresh(delivery)
    return delivery


# ── Delivery (worker side) ────────────────────────────────


def sign(secret: str, timestamp: int, body: bytes) -> str:
    digest = hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256)
    return f"t={timestamp},v1={digest.hexdigest()}"


async def _resolves_publicly(url: str) -> bool:
    """Checked at send time too, so a public hostname can't later point inward."""
    if _is_development():
        return True
    parts = urlsplit(url)
    try:
        infos = await asyncio.get_running_loop().getaddrinfo(
            parts.hostname, parts.port or 443, type=0
        )
    except OSError:
        return False
    return all(ipaddress.ip_address(info[4][0]).is_global for info in infos)


async def _send(
    client: httpx.AsyncClient, endpoint: WebhookEndpoint, delivery: WebhookDelivery
) -> tuple[int | None, str | None]:
    if not await _resolves_publicly(endpoint.url):
        return None, "URL does not resolve to a public address"
    body = json.dumps(delivery.payload, separators=(",", ":")).encode()
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Codeverity-Webhooks/1.0",
        "Codeverity-Event": delivery.event_type,
        "Codeverity-Delivery": str(delivery.id),
        "Codeverity-Signature": sign(endpoint.secret, int(time.time()), body),
    }
    try:
        response = await client.post(endpoint.url, content=body, headers=headers)
    except httpx.TimeoutException:
        return None, "timed out"
    except httpx.HTTPError as exc:
        return None, f"request failed: {type(exc).__name__}"
    if 200 <= response.status_code < 300:
        return response.status_code, None
    return response.status_code, f"HTTP {response.status_code}"


async def deliver_next(db: AsyncSession, client: httpx.AsyncClient) -> bool:
    """Send one due delivery. Returns False when nothing is due."""
    now = datetime.now(UTC)
    delivery = await db.scalar(
        select(WebhookDelivery)
        .where(
            WebhookDelivery.status == DeliveryStatus.pending,
            WebhookDelivery.next_attempt_at <= now,
        )
        .order_by(WebhookDelivery.next_attempt_at)
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    if delivery is None:
        await db.rollback()
        return False
    await attempt(db, client, delivery)
    return True


async def attempt(db: AsyncSession, client: httpx.AsyncClient, delivery: WebhookDelivery) -> None:
    """Make one delivery attempt and schedule a retry if it fails."""
    endpoint = await db.get(WebhookEndpoint, delivery.endpoint_id)
    if endpoint is None or not endpoint.active:
        delivery.status = DeliveryStatus.failed
        delivery.last_error = "endpoint disabled"
        await db.commit()
        return

    delivery.attempts += 1
    status_code, error = await _send(client, endpoint, delivery)
    delivery.last_status_code = status_code
    delivery.last_error = error
    if error is None:
        delivery.status = DeliveryStatus.succeeded
        delivery.delivered_at = datetime.now(UTC)
    elif delivery.attempts >= MAX_ATTEMPTS:
        delivery.status = DeliveryStatus.failed
    else:
        delivery.next_attempt_at = datetime.now(UTC) + RETRY_DELAYS[delivery.attempts - 1]
    await db.commit()
