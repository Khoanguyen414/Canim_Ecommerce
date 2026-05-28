from typing import Any
from app.clients.backend_client import backend_client
from app.utils.text_utils import normalize_text

class RecommendationService:
    def recommend_products(
        self,
        message: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        normalized_message = normalize_text(message)
        product_contexts = backend_client.get_product_contexts()
        if not product_contexts:
            return []
        scored_products: list[dict[str, Any]] = []

        for product in product_contexts:
            score = self._calculate_match_score(normalized_message, product)
            if score <= 0:
                continue
            product_with_score = dict(product)
            product_with_score["score"] = score
            scored_products.append(product_with_score)
        

        scored_products.sort(
            key=lambda item: item.get("score", 0),
            reverse=True,
        )
        # Sắp xếp sản phẩm theo điểm giảm dần.
        # Sản phẩm điểm cao nhất đứng đầu.
        # reverse=True nghĩa là từ cao xuống thấp.

        return scored_products[:limit]
        # Chỉ trả về tối đa limit sản phẩm đầu tiên.
    def _calculate_match_score(
        self,
        normalized_message: str,
        product: dict[str, Any],
    ) -> int:
        score = 0

        searchable_text = normalize_text(str(product.get("searchableText", "")))
        name = normalize_text(str(product.get("name", "")))
        category_name = normalize_text(str(product.get("categoryName", "")))
        color = normalize_text(str(product.get("color", "")))
        size = normalize_text(str(product.get("size", "")))
        message_words = [
            word
            for word in normalized_message.split(" ")
            if len(word) >= 2
        ]
        for word in message_words:
            if word in searchable_text:
                score += 1

        if name and name in normalized_message:
            score += 2

        if category_name and category_name in normalized_message:
            score += 2
        if color and color in normalized_message:
            score += 2

        if size and size in normalized_message:
            score += 1
        return score


recommendation_service = RecommendationService()
