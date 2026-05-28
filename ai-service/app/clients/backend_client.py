from typing import Any

import httpx

from app.core.config import get_settings


class BackendClient:
    # BackendClient là class chuyên gọi API backend Spring Boot.
    #
    # Nhiệm vụ:
    # - Không xử lý AI.
    # - Không phân tích intent/emotion.
    # - Chỉ gọi HTTP tới backend và trả dữ liệu về cho service khác.
    #
    # Vì sao cần tách riêng?
    # Nếu sau này backend đổi port, đổi path, đổi auth token,
    # mình chỉ sửa ở BackendClient, không sửa lung tung nhiều file.

    def __init__(self) -> None:
        # __init__ là hàm khởi tạo.
        # Khi tạo BackendClient(), hàm này chạy đầu tiên.

        self.settings = get_settings()
        # Lấy cấu hình từ .env/config.py.
        #
        # Ví dụ:
        # BACKEND_BASE_URL=http://localhost:8000/canim_ecommerce
        # BACKEND_PRODUCT_CONTEXT_PATH=/ai/products/context

        self.timeout_seconds = 10.0
        # timeout_seconds là thời gian chờ tối đa khi gọi backend.
        #
        # Nếu backend không phản hồi sau 10 giây,
        # Python sẽ báo lỗi thay vì chờ mãi.

    def build_url(self, path: str) -> str:
        # Hàm này ghép backend_base_url với path API.
        #
        # Input:
        # path = "/ai/products/context"
        #
        # Output:
        # "http://localhost:8000/canim_ecommerce/ai/products/context"

        base_url = self.settings.backend_base_url.rstrip("/")
        # rstrip("/") xóa dấu / ở cuối base_url nếu có.
        #
        # Ví dụ:
        # "http://localhost:8000/canim_ecommerce/"
        # -> "http://localhost:8000/canim_ecommerce"

        clean_path = path if path.startswith("/") else f"/{path}"
        # Nếu path đã bắt đầu bằng "/" thì giữ nguyên.
        # Nếu chưa có "/" thì thêm "/" vào trước.

        return f"{base_url}{clean_path}"
        # Ghép base_url và path thành URL đầy đủ.

    def get_product_contexts(self) -> list[dict[str, Any]]:
        # Hàm này gọi backend để lấy danh sách product context cho AI.
        #
        # Dữ liệu mong muốn backend trả về:
        # [
        #   {
        #     "productId": 1,
        #     "variantId": 2,
        #     "name": "Áo khoác denim",
        #     "color": "Xanh",
        #     "price": 450000,
        #     "availableQuantity": 18,
        #     "searchableText": "áo khoác denim xanh ..."
        #   }
        # ]

        url = self.build_url(self.settings.backend_product_context_path)
        # Tạo URL đầy đủ để gọi backend.
        #
        # Ví dụ:
        # http://localhost:8000/canim_ecommerce/ai/products/context

        try:
            response = httpx.get(url, timeout=self.timeout_seconds)
            # httpx.get(...) dùng để gọi API GET.
            #
            # timeout=self.timeout_seconds:
            # nếu backend phản hồi quá lâu thì dừng.

            response.raise_for_status()
            # Nếu backend trả status lỗi như 404, 500,
            # dòng này sẽ ném exception.
            #
            # Nếu status 200 thì đi tiếp.

            data = response.json()
            # Chuyển JSON response thành dữ liệu Python.

            if not isinstance(data, list):
                return []
            # Product context phải là danh sách.
            # Nếu backend trả object khác list thì trả [] để tránh lỗi service sau.

            return data

        except httpx.HTTPError:
            return []
            # Nếu backend chưa chạy, sai URL, timeout, 500...
            # tạm trả [] để AI service không crash.
            #
            # Sau này mình có thể bổ sung logging ở đây.


backend_client = BackendClient()
# Dòng này rất quan trọng.
#
# Nó tạo sẵn object backend_client để file khác import dùng:
#
# from app.clients.backend_client import backend_client
#
# Nếu thiếu dòng này sẽ bị lỗi:
# ImportError: cannot import name 'backend_client'