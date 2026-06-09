from typing import Any

import httpx

from app.core.config import get_settings


class BackendClient:
    """
    BackendClient chỉ chịu trách nhiệm gọi API Spring Boot.

    Logic mới:
    - Không gọi /ai/products/context nữa vì endpoint đó đang lỗi lazy loading.
    - Ưu tiên dùng /products/public, cùng nguồn dữ liệu với storefront.
    - Hỗ trợ nhiều kiểu response: list, data, data.content, content.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.timeout_seconds = 10.0

    def build_url(self, path: str) -> str:
        base_url = self.settings.backend_base_url.rstrip("/")
        clean_path = path if path.startswith("/") else f"/{path}"
        return f"{base_url}{clean_path}"

    def get_product_contexts(self) -> list[dict[str, Any]]:
        """
        Lấy danh sách sản phẩm cho AI từ API public.

        Không gọi:
        - /ai/products/context

        Chỉ gọi:
        - /products/public
        - fallback /products/public có phân trang nếu backend hỗ trợ.
        """

        paths = [
            self.settings.backend_product_context_path,
            self.settings.backend_products_path,
            "/products/public",
            "/products/public?pageNum=1&sizePage=100",
            "/products/public?pageNum=0&sizePage=100",
            "/products/public?page=1&size=100",
            "/products/public?page=0&size=100",
        ]

        seen_paths: set[str] = set()

        for path in paths:
            if not path or path in seen_paths:
                continue

            seen_paths.add(path)

            products = self._get_list_from_path(path)
            if products:
                return products

        print("[BackendClient] No product data found from public product paths")
        return []

    def get_user_recent_events(self, user_id: int, limit: int = 100) -> list[dict[str, Any]]:
        if not user_id:
            return []

        paths = [
            f"/ai/user-events/users/{user_id}/recent?limit={limit}",
            f"/api/ai/user-events/users/{user_id}/recent?limit={limit}",
            f"/user-events/users/{user_id}/recent?limit={limit}",
            f"/api/user-events/users/{user_id}/recent?limit={limit}",
        ]

        for path in paths:
            events = self._get_list_from_path(path)
            if events:
                return events

        return []

    def get_trending_events(self, days: int = 30) -> list[dict[str, Any]]:
        paths = [
            f"/ai/user-events/trending?days={days}",
            f"/api/ai/user-events/trending?days={days}",
            f"/user-events/trending?days={days}",
            f"/api/user-events/trending?days={days}",
        ]

        for path in paths:
            events = self._get_list_from_path(path)
            if events:
                return events

        return []

    def _get_list_from_path(self, path: str) -> list[dict[str, Any]]:
        url = self.build_url(path)

        try:
            print(f"[BackendClient] Calling: {url}")

            response = httpx.get(url, timeout=self.timeout_seconds)

            print(f"[BackendClient] Status: {response.status_code} | URL: {url}")

            response.raise_for_status()

            data = response.json()
            items = self._extract_items(data)

            print(f"[BackendClient] Extracted items: {len(items)} | URL: {url}")

            return items

        except httpx.HTTPStatusError as exception:
            print(
                "[BackendClient] HTTP status error:",
                exception.response.status_code,
                exception.response.text[:300],
                "| URL:",
                url,
            )
            return []

        except httpx.HTTPError as exception:
            print(f"[BackendClient] HTTP error: {exception} | URL: {url}")
            return []

        except ValueError as exception:
            print(f"[BackendClient] JSON parse error: {exception} | URL: {url}")
            return []

    def _extract_items(self, data: Any) -> list[dict[str, Any]]:
        """
        Hỗ trợ nhiều format response:

        1. List trực tiếp:
           [{...}, {...}]

        2. Page:
           {"content": [...]}

        3. Custom:
           {"data": [...]}

        4. Nested:
           {"data": {"content": [...]}}

        5. Một số backend dùng:
           {"data": {"items": [...]}}
        """

        if isinstance(data, list):
            return self._only_dict_items(data)

        if not isinstance(data, dict):
            return []

        keys = [
            "items",
            "products",
            "content",
            "data",
            "result",
            "results",
            "records",
        ]

        for key in keys:
            value = data.get(key)

            if isinstance(value, list):
                return self._only_dict_items(value)

            if isinstance(value, dict):
                nested_items = self._extract_items(value)

                if nested_items:
                    return nested_items

        return []

    def _only_dict_items(self, items: list[Any]) -> list[dict[str, Any]]:
        return [item for item in items if isinstance(item, dict)]


backend_client = BackendClient()