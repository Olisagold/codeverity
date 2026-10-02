from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    api_secret_key: str = "change-me"
    api_cors_origins: str = "http://localhost:3000"

    database_url: str = "postgresql://postgres:postgres@localhost:5432/codeverity"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me"
    jwt_expires_in: str = "7d"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/v1/auth/google/callback"

    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8000/v1/auth/github/callback"

    frontend_url: str = "http://localhost:3000"

    sendlib_api_key: str = ""
    sendlib_from_email: str = ""
    email_assets_url: str = (
        "https://raw.githubusercontent.com/Olisagold/codeverity/main/apps/web/public/icons"
    )

    instagram_url: str = "https://instagram.com"
    x_url: str = "https://x.com"
    github_url: str = "https://github.com"
    linkedin_url: str = "https://linkedin.com"

    # Model providers. A provider with no key is skipped.
    openai_api_key: str = ""
    openai_model: str = "gpt-6-luna"
    # Tried in order; a model that is rate limited or unavailable falls through
    # to the next, cheaper one.
    gemini_api_key: str = ""
    gemini_models: str = "gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite"
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-flash"
    # Reviews the other models' output and produces the final result.
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5-5"
    reviewer_effort: str = "medium"

    # Kept low to control cost: assessors think briefly and write short feedback.
    assessor_effort: str = "low"
    assessor_max_tokens: int = 4000
    model_timeout_seconds: float = 90
    # Fewest successful model assessments needed before the review runs.
    min_model_results: int = 2

    # Public API limits. 0 turns a limit off.
    rate_limit_requests_per_minute: int = 120
    rate_limit_assessments_per_minute: int = 10
    # Caps model spend: live assessments per organization per UTC day.
    live_assessments_per_day: int = 200

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.api_cors_origins.split(",") if origin.strip()]

    @property
    def gemini_model_list(self) -> list[str]:
        return [model.strip() for model in self.gemini_models.split(",") if model.strip()]

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
