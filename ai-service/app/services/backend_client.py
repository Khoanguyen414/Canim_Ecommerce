from typing import Any
from urllib.parse import urljoin

import httpx

from app.core.config import get_settings


class BackendClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.backend_base_url.rstrip("/")
        self.timeout_seconds = 10.0

    def build_url(self, path: str) -> str:
        clean_path = path.lstrip("/")
        return urljoin(f"{self.base_url}/", clean_path)

    def get_product_contexts(self) -> list[dict[str, Any]]:
        return self._get_list(self.settings.backend_product_context_path)

    def get_user_recent_events(self, user_id: int) -> list[dict[str, Any]]:
        return self._get_list(f"/ai/user-events/recent/user/{user_id}")

    def get_user_strong_events(self, user_id: int) -> list[dict[str, Any]]:
        return self._get_list(f"/ai/user-events/strong/user/{user_id}")

    def get_recent_product_events(self, product_id: int) -> list[dict[str, Any]]:
        return self._get_list(f"/ai/user-events/recent/product/{product_id}")

    def get_recent_system_events(self) -> list[dict[str, Any]]:
        return self._get_list("/ai/user-events/recent/system")

    def get_trending_user_events(self, days: int = 30) -> list[dict[str, Any]]:
        safe_days = days if days > 0 else 30
        return self._get_list(f"/ai/user-events/trending?days={safe_days}")

    def _get_list(self, path: str) -> list[dict[str, Any]]:
        url = self.build_url(path)

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.get(url)
                response.raise_for_status()

                data = response.json()

                if isinstance(data, list):
                    return [
                        item
                        for item in data
                        if isinstance(item, dict)
                    ]

                return []

        except httpx.HTTPError:
            return []
        except ValueError:
            return []


backend_client = BackendClient()