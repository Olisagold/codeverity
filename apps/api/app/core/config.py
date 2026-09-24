from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    api_secret_key: str = "change-me"
    api_cors_origins: str = "http://localhost:3000"

    database_url: str = "postgresql://postgres:postgres@localhost:5432/codeverity"
    redis_url: str = "redis://localhost:6379/0"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.api_cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        # .env keeps a plain postgresql:// URL so other tools can share it;
        # SQLAlchemy needs the asyncpg driver spelled out.
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
