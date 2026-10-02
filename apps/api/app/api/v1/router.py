from fastapi import APIRouter

from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.me import router as me_router
from app.api.v1.usage import router as usage_router
from app.api.v1.webhooks import router as webhooks_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(api_keys_router)
api_router.include_router(me_router)
api_router.include_router(assessments_router)
api_router.include_router(webhooks_router)
api_router.include_router(usage_router)
api_router.include_router(dashboard_router)
