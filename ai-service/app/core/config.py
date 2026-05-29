from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==============================
    # App
    # ==============================
    app_env: str = "development"
    app_name: str = "Canim AI Service"

    # ==============================
    # FastAPI server
    # ==============================
    ai_service_host: str = "127.0.0.1"
    ai_service_port: int = 8001

    # ==============================
    # Backend Spring Boot
    # ==============================

    # Ví dụ:
    # http://localhost:8000/canim_ecommerce
    backend_base_url: str = "http://localhost:8000/canim_ecommerce"

    # API sạch dành riêng cho AI.
    # Nếu backend chưa có API này thì BackendClient sẽ fallback sang backend_products_path.
    backend_product_context_path: str = "/ai/products/context"

    # API product mà Admin đang dùng.
    # Ví dụ:
    # /products?pageNum=1&sizePage=100
    backend_products_path: str = "/products?pageNum=1&sizePage=100"

    # ==============================
    # Frontend URLs
    # ==============================
    customer_frontend_url: str = "http://localhost:5173"
    admin_frontend_url: str = "http://localhost:5174"

    # ==============================
    # AI mode
    # ==============================
    ai_nlu_mode: str = "rule_based"

    # ==============================
    # Debug
    # ==============================
    debug: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()