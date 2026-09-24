from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.redis import get_redis
from app.db.session import engine


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await engine.dispose()
    # `get_redis()` is `lru_cache`d, so its connections stay bound to this
    # loop unless we close them and drop the cached client here — otherwise
    # the next event loop to use it (e.g. the next test module's TestClient)
    # crashes with "Event loop is closed".
    await get_redis().aclose()
    get_redis.cache_clear()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Codeverity API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(api_router)

    return app


app = create_app()
