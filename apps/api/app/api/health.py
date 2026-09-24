from fastapi import APIRouter, Response, status
from redis.asyncio import Redis
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness: the process is up and serving requests."""
    return {"status": "ok"}


@router.get("/health/ready")
async def ready(response: Response) -> dict[str, object]:
    """Readiness: dependencies (Postgres, Redis) are reachable."""
    checks: dict[str, str] = {}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc.__class__.__name__}"

    try:
        redis = Redis.from_url(get_settings().redis_url)
        try:
            await redis.ping()
        finally:
            await redis.aclose()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {exc.__class__.__name__}"

    healthy = all(value == "ok" for value in checks.values())
    if not healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if healthy else "degraded", "checks": checks}
