import json
from datetime import datetime, timezone
from typing import Any, Optional

from app.clients.backend_client import backend_client
from app.utils.text_utils import normalize_text


EVENT_WEIGHTS: dict[str, int] = {
    "VIEW": 1,
    "CLICK": 2,
    "SEARCH": 3,
    "ADD_TO_CART": 4,
    "PURCHASE": 10,
}

DEFAULT_LIMIT = 8

class RecommendationEngineService:
    def recommend_for_user(
        self,
        user_id: int,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        product_contexts = self._get_product_contexts()
        user_events = self._get_user_recent_events(user_id)

        if not product_contexts:
            return []

        user_profile = self._build_user_profile(user_events)

        scored_products: list[dict[str, Any]] = []

        for product in product_contexts:
            if not self._is_recommendable_product(product):
                continue

            score, reasons = self._score_product_for_user(
                product=product,
                user_profile=user_profile,
            )

            if score <= 0:
                continue

            product_with_score = dict(product)
            product_with_score["recommendationScore"] = round(score, 2)
            product_with_score["recommendationReasons"] = reasons
            product_with_score["score"] = round(score)

            scored_products.append(product_with_score)

        scored_products.sort(
            key=lambda item: item.get("recommendationScore", 0),
            reverse=True,
        )

        return scored_products[:limit]

    def recommend_trending(
        self,
        limit: int = DEFAULT_LIMIT,
        days: int = 30,
    ) -> list[dict[str, Any]]:
        product_contexts = self._get_product_contexts()
        trending_events = self._get_trending_events(days=days)

        if not product_contexts:
            return []

        product_scores = self._build_product_score_map(trending_events)

        scored_products: list[dict[str, Any]] = []

        for product in product_contexts:
            if not self._is_recommendable_product(product):
                continue

            product_id = self._safe_int(product.get("productId"))
            score = float(product_scores.get(product_id, 0))

            if score <= 0:
                continue

            product_with_score = dict(product)
            product_with_score["recommendationScore"] = round(score, 2)
            product_with_score["recommendationReasons"] = [
                "Sản phẩm đang được nhiều khách quan tâm hoặc mua gần đây"
            ]
            product_with_score["score"] = round(score)

            scored_products.append(product_with_score)

        scored_products.sort(
            key=lambda item: item.get("recommendationScore", 0),
            reverse=True,
        )

        return scored_products[:limit]

    def recommend_similar(
        self,
        product_id: int,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        product_contexts = self._get_product_contexts()

        if not product_contexts:
            return []

        target_product = self._find_product_context(product_contexts, product_id)

        if target_product is None:
            return []

        scored_products: list[dict[str, Any]] = []

        for product in product_contexts:
            if not self._is_recommendable_product(product):
                continue

            current_product_id = self._safe_int(product.get("productId"))

            if current_product_id == product_id:
                continue

            score, reasons = self._score_similar_product(
                target_product=target_product,
                candidate_product=product,
            )

            if score <= 0:
                continue

            product_with_score = dict(product)
            product_with_score["recommendationScore"] = round(score, 2)
            product_with_score["recommendationReasons"] = reasons
            product_with_score["score"] = round(score)

            scored_products.append(product_with_score)

        scored_products.sort(
            key=lambda item: item.get("recommendationScore", 0),
            reverse=True,
        )

        return scored_products[:limit]

    def recommend_contextual(
        self,
        message: str,
        user_id: Optional[int] = None,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:

        product_contexts = self._get_product_contexts()

        if not product_contexts:
            return []

        normalized_message = normalize_text(message)
        user_profile = {}

        if user_id is not None:
            user_events = self._get_user_recent_events(user_id)
            user_profile = self._build_user_profile(user_events)

        scored_products: list[dict[str, Any]] = []

        for product in product_contexts:
            if not self._is_recommendable_product(product):
                continue

            text_score, text_reasons = self._score_product_by_text(
                product=product,
                normalized_message=normalized_message,
            )

            behavior_score = 0.0
            behavior_reasons: list[str] = []

            if user_profile:
                behavior_score, behavior_reasons = self._score_product_for_user(
                    product=product,
                    user_profile=user_profile,
                )

            final_score = text_score + behavior_score
            reasons = text_reasons + behavior_reasons

            if final_score <= 0:
                continue

            product_with_score = dict(product)
            product_with_score["recommendationScore"] = round(final_score, 2)
            product_with_score["recommendationReasons"] = reasons
            product_with_score["score"] = round(final_score)

            scored_products.append(product_with_score)

        scored_products.sort(
            key=lambda item: item.get("recommendationScore", 0),
            reverse=True,
        )

        return scored_products[:limit]

    def _get_product_contexts(self) -> list[dict[str, Any]]:

        try:
            products = backend_client.get_product_contexts()
            return products if isinstance(products, list) else []
        except Exception:
            return []

    def _get_user_recent_events(self, user_id: int) -> list[dict[str, Any]]:
        return self._safe_backend_call("get_user_recent_events", user_id)

    def _get_trending_events(self, days: int) -> list[dict[str, Any]]:
        return self._safe_backend_call("get_trending_user_events", days)

    def _safe_backend_call(
        self,
        method_name: str,
        *args: Any,
    ) -> list[dict[str, Any]]:
        method = getattr(backend_client, method_name, None)

        if method is None:
            return []

        try:
            result = method(*args)
            return result if isinstance(result, list) else []
        except Exception:
            return []

    def _build_user_profile(
        self,
        events: list[dict[str, Any]],
    ) -> dict[str, Any]:
        product_scores: dict[int, float] = {}
        color_scores: dict[str, float] = {}
        size_scores: dict[str, float] = {}
        keyword_scores: dict[str, float] = {}
        price_values: list[float] = []

        for event in events:
            event_type = str(event.get("eventType") or "")
            event_weight = self._safe_float(
                event.get("eventWeight"),
                default=float(EVENT_WEIGHTS.get(event_type, 0)),
            )

            recency_multiplier = self._recency_multiplier(event.get("occurredAt"))
            weighted_score = event_weight * recency_multiplier

            product_id = self._safe_int(event.get("productId"))

            if product_id is not None:
                product_scores[product_id] = (
                    product_scores.get(product_id, 0.0) + weighted_score
                )

            meta = self._parse_event_meta(event.get("eventMeta"))

            color = self._safe_str(meta.get("color"))
            size = self._safe_str(meta.get("size"))
            keyword = self._safe_str(meta.get("keyword"))
            price = self._safe_float(meta.get("price"), default=0.0)

            if color:
                color_scores[color] = color_scores.get(color, 0.0) + weighted_score

            if size:
                size_scores[size] = size_scores.get(size, 0.0) + weighted_score

            if keyword:
                keyword_scores[keyword] = keyword_scores.get(keyword, 0.0) + weighted_score

            if price > 0:
                price_values.append(price)

        average_price = (
            sum(price_values) / len(price_values)
            if price_values
            else None
        )

        return {
            "product_scores": product_scores,
            "color_scores": color_scores,
            "size_scores": size_scores,
            "keyword_scores": keyword_scores,
            "average_price": average_price,
        }

    def _build_product_score_map(
        self,
        events: list[dict[str, Any]],
    ) -> dict[int, float]:

        product_scores: dict[int, float] = {}

        for event in events:
            product_id = self._safe_int(event.get("productId"))

            if product_id is None:
                continue

            event_type = str(event.get("eventType") or "")
            event_weight = self._safe_float(
                event.get("eventWeight"),
                default=float(EVENT_WEIGHTS.get(event_type, 0)),
            )

            recency_multiplier = self._recency_multiplier(event.get("occurredAt"))
            score = event_weight * recency_multiplier

            product_scores[product_id] = product_scores.get(product_id, 0.0) + score

        return product_scores

    def _score_product_for_user(
        self,
        product: dict[str, Any],
        user_profile: dict[str, Any],
    ) -> tuple[float, list[str]]:

        score = 0.0
        reasons: list[str] = []

        product_id = self._safe_int(product.get("productId"))
        product_scores = user_profile.get("product_scores", {})

        if product_id is not None and product_id in product_scores:
            product_score = float(product_scores[product_id])
            score += product_score
            reasons.append("Bạn đã từng quan tâm sản phẩm này")

        color = self._safe_str(product.get("color"))
        color_scores = user_profile.get("color_scores", {})

        if color and color in color_scores:
            score += min(float(color_scores[color]) * 0.4, 4.0)
            reasons.append(f"Phù hợp màu bạn hay quan tâm: {color}")

        size = self._safe_str(product.get("size"))
        size_scores = user_profile.get("size_scores", {})

        if size and size in size_scores:
            score += min(float(size_scores[size]) * 0.3, 3.0)
            reasons.append(f"Phù hợp size bạn hay chọn: {size}")

        average_price = user_profile.get("average_price")
        product_price = self._safe_float(product.get("price"), default=0.0)

        if average_price and product_price > 0:
            price_score = self._score_price_similarity(product_price, average_price)
            if price_score > 0:
                score += price_score
                reasons.append("Nằm trong khoảng giá bạn thường quan tâm")

        keyword_scores = user_profile.get("keyword_scores", {})
        searchable_text = normalize_text(
            " ".join(
                [
                    self._safe_str(product.get("name")),
                    self._safe_str(product.get("categoryName")),
                    self._safe_str(product.get("brand")),
                    self._safe_str(product.get("searchableText")),
                ]
            )
        )

        for keyword, keyword_score in keyword_scores.items():
            normalized_keyword = normalize_text(keyword)
            if normalized_keyword and normalized_keyword in searchable_text:
                score += min(float(keyword_score) * 0.5, 3.0)
                reasons.append(f"Khớp từ khóa bạn từng tìm: {keyword}")

        return score, self._unique_reasons(reasons)

    def _score_product_by_text(
        self,
        product: dict[str, Any],
        normalized_message: str,
    ) -> tuple[float, list[str]]:
        # Tính điểm sản phẩm theo câu khách nhập.
        #
        # Ví dụ:
        # message = "áo khoác xanh size L"
        # product có searchableText chứa áo khoác, xanh, L
        # → score tăng.

        if not normalized_message:
            return 0.0, []

        score = 0.0
        reasons: list[str] = []

        name = normalize_text(self._safe_str(product.get("name")))
        category = normalize_text(self._safe_str(product.get("categoryName")))
        brand = normalize_text(self._safe_str(product.get("brand")))
        color = normalize_text(self._safe_str(product.get("color")))
        size = normalize_text(self._safe_str(product.get("size")))
        searchable_text = normalize_text(self._safe_str(product.get("searchableText")))

        product_text = " ".join(
            [name, category, brand, color, size, searchable_text]
        )

        message_tokens = [
            token
            for token in normalized_message.split()
            if len(token) >= 2
        ]

        matched_tokens = 0

        for token in message_tokens:
            if token in product_text:
                matched_tokens += 1

        if matched_tokens > 0:
            score += matched_tokens
            reasons.append("Khớp nội dung khách đang tìm")

        if category and category in normalized_message:
            score += 4
            reasons.append("Khớp danh mục sản phẩm")

        if color and color in normalized_message:
            score += 3
            reasons.append("Khớp màu sắc khách muốn")

        if size and size in normalized_message:
            score += 2
            reasons.append("Khớp size khách muốn")

        if name and name in normalized_message:
            score += 5
            reasons.append("Khớp tên sản phẩm")

        return score, self._unique_reasons(reasons)

    def _score_similar_product(
        self,
        target_product: dict[str, Any],
        candidate_product: dict[str, Any],
    ) -> tuple[float, list[str]]:
        # Tính điểm sản phẩm tương tự.

        score = 0.0
        reasons: list[str] = []

        if self._same_text_field(target_product, candidate_product, "categoryName"):
            score += 5
            reasons.append("Cùng danh mục")

        if self._same_text_field(target_product, candidate_product, "brand"):
            score += 2
            reasons.append("Cùng thương hiệu")

        if self._same_text_field(target_product, candidate_product, "color"):
            score += 2
            reasons.append("Cùng màu sắc")

        if self._same_text_field(target_product, candidate_product, "size"):
            score += 1
            reasons.append("Cùng size")

        target_price = self._safe_float(target_product.get("price"), default=0.0)
        candidate_price = self._safe_float(candidate_product.get("price"), default=0.0)

        if target_price > 0 and candidate_price > 0:
            price_score = self._score_price_similarity(candidate_price, target_price)
            if price_score > 0:
                score += price_score
                reasons.append("Khoảng giá tương tự")

        return score, self._unique_reasons(reasons)

    def _find_product_context(
        self,
        product_contexts: list[dict[str, Any]],
        product_id: int,
    ) -> Optional[dict[str, Any]]:
        for product in product_contexts:
            if self._safe_int(product.get("productId")) == product_id:
                return product

        return None

    def _is_recommendable_product(self, product: dict[str, Any]) -> bool:
        # Kiểm tra sản phẩm có nên gợi ý không.
        #
        # Không gợi ý:
        # - sản phẩm inactive
        # - variant inactive
        # - hết hàng

        product_status = self._safe_str(product.get("productStatus"))
        variant_active = product.get("variantActive")
        available_quantity = self._safe_int(product.get("availableQuantity"))

        if product_status and product_status != "ACTIVE":
            return False

        if variant_active is False:
            return False

        if available_quantity is not None and available_quantity <= 0:
            return False

        return True

    def _parse_event_meta(self, raw_meta: Any) -> dict[str, Any]:
        if raw_meta is None:
            return {}

        if isinstance(raw_meta, dict):
            return raw_meta

        if not isinstance(raw_meta, str):
            return {}

        try:
            parsed = json.loads(raw_meta)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}

    def _recency_multiplier(self, occurred_at: Any) -> float:
        # Tính hệ số thời gian.
        #
        # Event càng mới thì điểm càng cao.
        #
        # 0-7 ngày: 1.2
        # 8-30 ngày: 1.0
        # 31-90 ngày: 0.7
        # cũ hơn: 0.4

        if not occurred_at:
            return 1.0

        occurred_datetime = self._parse_datetime(occurred_at)

        if occurred_datetime is None:
            return 1.0

        now = datetime.now(timezone.utc)

        if occurred_datetime.tzinfo is None:
            occurred_datetime = occurred_datetime.replace(tzinfo=timezone.utc)

        days = (now - occurred_datetime).days

        if days <= 7:
            return 1.2

        if days <= 30:
            return 1.0

        if days <= 90:
            return 0.7

        return 0.4

    def _parse_datetime(self, value: Any) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value

        if not isinstance(value, str):
            return None

        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None

    def _score_price_similarity(
        self,
        product_price: float,
        target_price: float,
    ) -> float:
        if product_price <= 0 or target_price <= 0:
            return 0.0

        difference_ratio = abs(product_price - target_price) / target_price

        if difference_ratio <= 0.1:
            return 3.0

        if difference_ratio <= 0.25:
            return 2.0

        if difference_ratio <= 0.4:
            return 1.0

        return 0.0

    def _same_text_field(
        self,
        left: dict[str, Any],
        right: dict[str, Any],
        field_name: str,
    ) -> bool:
        left_value = normalize_text(self._safe_str(left.get(field_name)))
        right_value = normalize_text(self._safe_str(right.get(field_name)))

        return bool(left_value and right_value and left_value == right_value)

    def _safe_int(self, value: Any) -> Optional[int]:
        if value is None:
            return None

        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _safe_float(self, value: Any, default: float = 0.0) -> float:
        if value is None:
            return default

        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def _safe_str(self, value: Any) -> str:
        if value is None:
            return ""

        return str(value).strip()

    def _unique_reasons(self, reasons: list[str]) -> list[str]:
        unique: list[str] = []

        for reason in reasons:
            if reason and reason not in unique:
                unique.append(reason)

        return unique


recommendation_engine_service = RecommendationEngineService()