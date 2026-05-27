from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
   app_env: str = "development"
   app_name: str = "Canim AI Service"
   ai_service_host: str = "127.0.0.1"
   ai_service_port: int = 8001
   backend_base_url: str = "http://localhost:8000/canim_ecommerce"
   backend_product_context_path: str = "/ai/products/context"
   customer_frontend_url: str = "http://localhost:5173"
   admin_frontend_url: str = "http://localhost:5174"
   ai_nlu_mode: str = "rule_based"
   debug: bool = True
   
   model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
@lru_cache
def get_settings() -> Settings:
   
    return Settings()