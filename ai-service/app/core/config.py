from functools import lru_cache

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "Canim AI Service"

    ai_service_host: str = "127.0.0.1"
    ai_service_port: int = Field(
        default=8001,
        validation_alias=AliasChoices("AI_PORT", "AI_SERVICE_PORT", "PORT"),
    )

    backend_base_url: str = Field(
        default="http://localhost:8000/canim_ecommerce",
        validation_alias=AliasChoices("BACKEND_API_BASE_URL", "BACKEND_BASE_URL"),
    )

    backend_product_context_path: str = "/ai/products/context"
    backend_products_path: str = "/products?pageNum=1&sizePage=100"

    customer_frontend_url: str = "http://localhost:5173"
    admin_frontend_url: str = "http://localhost:5174"
    ai_cors_allowed_origins: str = Field(default="", validation_alias="AI_CORS_ALLOWED_ORIGINS")

    ai_nlu_mode: str = "rule_based"
    debug: bool = Field(default=True, validation_alias="AI_DEBUG")

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug_flag(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    def cors_origins(self) -> list[str]:
        if self.ai_cors_allowed_origins.strip():
            return [
                origin.strip()
                for origin in self.ai_cors_allowed_origins.split(",")
                if origin.strip()
            ]

        origins: list[str] = []
        for origin in (self.customer_frontend_url, self.admin_frontend_url):
            if origin and origin not in origins:
                origins.append(origin)
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
