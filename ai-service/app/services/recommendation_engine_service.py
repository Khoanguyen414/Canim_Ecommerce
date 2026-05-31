from typing import Any

from app.clients.backend_client import backend_client


DEFAULT_LIMIT = 8

SCORING_STOPWORDS = frozenset(
    {
        "goi",
        "y",
        "tim",
        "mua",
        "chon",
        "loc",
        "shop",
        "co",
        "ban",
        "san",
        "pham",
        "can",
        "toi",
        "tooi",
        "em",
        "minh",
        "muon",
        "cho",
        "nao",
        "gi",
        "the",
        "mot",
        "vai",
        "nhu",
        "cua",
        "trong",
        "hay",
        "la",
        "se",
        "ma",
        "dang",
        "recommend",
        "suggest",
        "ve",
        "xin",
        "oi",
        "ak",
        "product",
        "hang",
        "item",
        "outfit",
        "phoi",
        "thoi",
        "mau",
    }
)

GENDER_TOKENS = frozenset({"nam", "nu", "unisex"})

PRODUCT_ANCHOR_TOKENS = frozenset(
    {
        "giay",
        "sneaker",
        "dep",
        "sandal",
        "boot",
        "ao",
        "polo",
        "thun",
        "hoodie",
        "blazer",
        "khoac",
        "quan",
        "jean",
        "vay",
        "dam",
        "tui",
        "balo",
        "non",
        "mu",
        "basic",
        "local",
        "chuyen",
        "day",
        "lac",
        "nhan",
        "vong",
        "bong",
        "tai",
        "mat",
        "khan",
        "kinh",
    }
)


class RecommendationEngineService:
    """
    RecommendationEngineService là nơi tính gợi ý sản phẩm.

    Logic chính:
    - Lấy sản phẩm từ backend.
    - Normalize field vì backend có thể trả productId hoặc id, imageUrl hoặc image_url.
    - Match query khách theo name, slug, category, color, size, searchableText.
    - Không fallback sản phẩm không liên quan khi query cụ thể không match.
    """

    def __init__(self) -> None:
        self.backend_client = backend_client

    def recommend_contextual(
        self,
        message: str,
        user_id: int | None = None,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        products = self._get_recommendable_products()

        if not products:
            print("[RecommendationEngine] No products from backend")
            return []

        query = self._normalize_text(message)
        scored_products: list[dict[str, Any]] = []

        for product in products:
            score, reasons = self._score_by_query(product, query)

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

        if scored_products:
            return self._dedupe_by_product_id(scored_products, limit, query=query)

        if self._tokenize(query):
            print(
                "[RecommendationEngine] Query no match, returning empty:",
                query,
            )
            return []

        fallback_products = self._fallback_products(products, limit=limit)

        print(
            "[RecommendationEngine] Empty query, fallback products:",
            len(fallback_products),
        )

        return fallback_products

    def recommend_for_user(
        self,
        user_id: int,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        products = self._get_recommendable_products()

        if not products:
            return []

        return self._fallback_products(products, limit=limit)

    def recommend_trending(
        self,
        limit: int = DEFAULT_LIMIT,
        days: int = 30,
    ) -> list[dict[str, Any]]:
        products = self._get_recommendable_products()

        if not products:
            return []

        events = self.backend_client.get_trending_events(days=days)
        event_scores = self._build_event_score_map(events)

        if not event_scores:
            return self._fallback_products(products, limit=limit)

        scored_products: list[dict[str, Any]] = []

        for product in products:
            product_id = self._safe_int(product.get("product_id"))
            score = float(event_scores.get(product_id, 0))

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

        if scored_products:
            return self._dedupe_by_product_id(scored_products, limit)

        return self._fallback_products(products, limit=limit)

    def recommend_similar(
        self,
        product_id: int,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        products = self._get_recommendable_products()

        if not products:
            return []

        target_product = None

        for product in products:
            if self._safe_int(product.get("product_id")) == product_id:
                target_product = product
                break

        if not target_product:
            return self._fallback_products(products, limit=limit)

        target_text = self._build_search_text(target_product)
        scored_products: list[dict[str, Any]] = []

        for product in products:
            current_product_id = self._safe_int(product.get("product_id"))

            if current_product_id == product_id:
                continue

            score, reasons = self._score_similarity(product, target_text, target_product)

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

        if scored_products:
            return self._dedupe_by_product_id(scored_products, limit)

        return self._fallback_products(products, limit=limit)

    def recommend_also_viewed(
        self,
        product_id: int,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        return self.recommend_similar(product_id=product_id, limit=limit)

    def _get_recommendable_products(self) -> list[dict[str, Any]]:
        raw_products = self.backend_client.get_product_contexts()
        normalized_products: list[dict[str, Any]] = []

        for raw_product in raw_products:
            product = self._normalize_product(raw_product)

            if not self._is_recommendable_product(product):
                continue

            normalized_products.append(product)

        print("[RecommendationEngine] recommendable products:", len(normalized_products))

        return normalized_products

    def _normalize_product(self, raw: dict[str, Any]) -> dict[str, Any]:
        product_id = self._first_value(
            raw,
            ["product_id", "productId", "id"],
        )

        variant_id = self._first_value(
            raw,
            ["variant_id", "variantId", "defaultVariantId"],
        )

        name = self._first_value(
            raw,
            ["name", "productName", "title"],
        )

        slug = self._first_value(
            raw,
            ["slug", "productSlug"],
        )

        brand = self._first_value(
            raw,
            ["brand", "brandName"],
        )

        category_name = self._first_value(
            raw,
            ["category_name", "categoryName", "category"],
        )

        color = self._first_value(
            raw,
            ["color", "variantColor"],
        )

        size = self._first_value(
            raw,
            ["size", "variantSize"],
        )

        price = self._first_value(
            raw,
            ["price", "salePrice", "finalPrice", "minPrice"],
        )

        available_quantity = self._first_value(
            raw,
            [
                "available_quantity",
                "availableQuantity",
                "stock",
                "totalStock",
                "inventoryQuantity",
                "quantity",
            ],
        )

        image_url = self._first_value(
            raw,
            [
                "image_url",
                "imageUrl",
                "mainImageUrl",
                "thumbnail",
                "thumbnailUrl",
                "image",
            ],
        )

        status = self._first_value(
            raw,
            ["status", "productStatus"],
        )

        searchable_text = self._first_value(
            raw,
            ["searchableText", "searchable_text", "description"],
        )

        normalized = {
            "product_id": self._safe_int(product_id),
            "variant_id": self._safe_int(variant_id),
            "name": self._safe_str(name),
            "slug": self._safe_str(slug),
            "brand": self._safe_str(brand),
            "category_name": self._safe_str(category_name),
            "color": self._safe_str(color),
            "size": self._safe_str(size),
            "price": self._safe_number(price),
            "available_quantity": self._safe_int(available_quantity),
            "image_url": self._safe_str(image_url),
            "status": self._safe_str(status),
            "searchableText": self._safe_str(searchable_text),
        }

        normalized["searchText"] = self._build_search_text(normalized)

        return normalized

    def _is_recommendable_product(self, product: dict[str, Any]) -> bool:
        product_id = self._safe_int(product.get("product_id"))

        if product_id is None:
            return False

        status = self._normalize_text(product.get("status"))

        if status and status not in ["active", "available", "dang hien thi"]:
            return False

        quantity = product.get("available_quantity")

        if isinstance(quantity, int) and quantity <= 0:
            return False

        return True

    def extract_product_query_label(self, message: str) -> str | None:
        query = self._normalize_text(message)
        meaningful_tokens = self._meaningful_query_tokens(query)

        if not meaningful_tokens:
            return None

        return " ".join(meaningful_tokens)

    def _meaningful_query_tokens(self, query: str) -> list[str]:
        return [
            token
            for token in self._tokenize(query)
            if token not in SCORING_STOPWORDS and len(token) >= 2
        ]

    def _required_anchor_tokens(self, query_tokens: list[str]) -> list[str]:
        return [token for token in query_tokens if token in PRODUCT_ANCHOR_TOKENS]

    def _as_token_set(self, text: str) -> set[str]:
        return set(self._tokenize(text))

    def _text_has_token(self, text: str, token: str) -> bool:
        if not text or not token:
            return False

        if " " in token:
            return token in self._normalize_text(text)

        return token in self._as_token_set(text)

    def _product_matches_required_anchors(
        self,
        product_name: str,
        search_text: str,
        required_anchors: list[str],
    ) -> bool:
        if not required_anchors:
            return True

        product_tokens = self._as_token_set(product_name)
        search_tokens = self._as_token_set(search_text)
        combined_tokens = product_tokens | search_tokens

        return any(anchor in combined_tokens for anchor in required_anchors)

    def _score_by_query(
        self,
        product: dict[str, Any],
        query: str,
    ) -> tuple[float, list[str]]:
        if not query:
            return 1.0, ["Sản phẩm đang bán trong shop"]

        search_text = self._build_search_text(product)
        product_name = self._normalize_text(product.get("name"))
        slug = self._normalize_text(product.get("slug"))
        category = self._normalize_text(product.get("category_name"))
        color = self._normalize_text(product.get("color"))
        size = self._normalize_text(product.get("size"))

        query_tokens = self._tokenize(query)
        meaningful_tokens = self._meaningful_query_tokens(query)
        required_anchors = self._required_anchor_tokens(meaningful_tokens)

        product_tokens = self._as_token_set(product_name)
        category_tokens = self._as_token_set(category)
        color_tokens = self._as_token_set(color)
        size_tokens = self._as_token_set(size)
        search_tokens = self._as_token_set(search_text)

        if not self._product_matches_required_anchors(
            product_name=product_name,
            search_text=search_text,
            required_anchors=required_anchors,
        ):
            return 0.0, []

        score = 0.0
        reasons: list[str] = []
        has_strong_match = False

        meaningful_phrase = " ".join(meaningful_tokens)

        if meaningful_phrase and len(meaningful_tokens) >= 2 and meaningful_phrase in product_name:
            score += 12
            has_strong_match = True
            reasons.append("Tên sản phẩm khớp cụm từ khách tìm")

        if product_name and product_name in query:
            score += 10
            has_strong_match = True
            reasons.append("Tên sản phẩm khớp trực tiếp với nhu cầu")

        if slug and slug.replace("-", " ") in query:
            score += 8
            has_strong_match = True
            reasons.append("Slug sản phẩm khớp với từ khóa tìm kiếm")

        for token in meaningful_tokens:
            if token in GENDER_TOKENS:
                if token in product_tokens:
                    score += 2
                    reasons.append(f"Khớp phân loại: {token}")
                continue

            if token in product_tokens:
                score += 4
                has_strong_match = True
                reasons.append(f"Khớp tên sản phẩm: {token}")
                continue

            if token in category_tokens:
                score += 3
                has_strong_match = True
                reasons.append(f"Khớp danh mục: {token}")
                continue

            if token in color_tokens:
                score += 3
                reasons.append(f"Khớp màu sắc: {token}")
                continue

            if token in size_tokens:
                score += 2
                reasons.append(f"Khớp size: {token}")
                continue

            if token in search_tokens and token in PRODUCT_ANCHOR_TOKENS:
                score += 2
                has_strong_match = True
                reasons.append(f"Khớp loại sản phẩm: {token}")

        if (
            "outfit" in query_tokens
            or "phoi" in query_tokens
            or "di" in query_tokens
        ):
            score += self._score_outfit_product(product, meaningful_tokens)

            if score > 0:
                reasons.append("Phù hợp để phối outfit")

        if score <= 0 or not has_strong_match:
            return 0.0, []

        if not reasons:
            reasons.append("Sản phẩm phù hợp với nhu cầu tìm kiếm")

        return score, self._deduplicate_reasons(reasons)

    def _score_outfit_product(
        self,
        product: dict[str, Any],
        query_tokens: list[str],
    ) -> float:
        search_text = self._build_search_text(product)
        score = 0.0

        outfit_keywords = [
            "ao",
            "quan",
            "vay",
            "dam",
            "giay",
            "blazer",
            "so",
            "mi",
            "thun",
        ]

        if any(keyword in search_text for keyword in outfit_keywords):
            score += 2

        if "lam" in query_tokens and any(
            keyword in search_text
            for keyword in ["so mi", "blazer", "quan", "giay", "basic"]
        ):
            score += 3

        if "choi" in query_tokens and any(
            keyword in search_text
            for keyword in ["thun", "giay", "jean", "basic"]
        ):
            score += 3

        if "be" in query_tokens and any(
            keyword in search_text for keyword in ["be", "kem", "nau"]
        ):
            score += 4

        return score

    def _score_similarity(
        self,
        product: dict[str, Any],
        target_text: str,
        target_product: dict[str, Any],
    ) -> tuple[float, list[str]]:
        product_text = self._build_search_text(product)
        target_tokens = self._tokenize(target_text)

        score = 0.0
        reasons: list[str] = []

        for token in target_tokens:
            if len(token) >= 2 and token in product_text:
                score += 1

        if product.get("category_name") and product.get("category_name") == target_product.get("category_name"):
            score += 5
            reasons.append("Cùng danh mục sản phẩm")

        if product.get("color") and product.get("color") == target_product.get("color"):
            score += 2
            reasons.append("Cùng màu sắc")

        if product.get("brand") and product.get("brand") == target_product.get("brand"):
            score += 2
            reasons.append("Cùng thương hiệu")

        if score > 0 and not reasons:
            reasons.append("Có nhiều đặc điểm tương tự")

        return score, reasons

    def _dedupe_by_product_id(
        self,
        products: list[dict[str, Any]],
        limit: int,
        query: str = "",
    ) -> list[dict[str, Any]]:
        query_tokens = self._tokenize(query)
        grouped: dict[int | None, list[dict[str, Any]]] = {}

        for product in products:
            product_id = self._safe_int(product.get("product_id"))
            grouped.setdefault(product_id, []).append(product)

        ranked_groups = sorted(
            grouped.values(),
            key=lambda variants: max(
                self._variant_selection_score(variant, query_tokens)
                for variant in variants
            ),
            reverse=True,
        )

        deduped: list[dict[str, Any]] = []

        for variants in ranked_groups:
            best_variant = max(
                variants,
                key=lambda variant: self._variant_selection_score(variant, query_tokens),
            )
            deduped.append(best_variant)

            if len(deduped) >= limit:
                break

        return deduped

    def _variant_selection_score(
        self,
        product: dict[str, Any],
        query_tokens: list[str],
    ) -> float:
        score = float(product.get("recommendationScore") or 0)
        color = self._normalize_text(product.get("color"))
        size = self._normalize_text(product.get("size"))
        stock = float(product.get("available_quantity") or 0)

        for token in query_tokens:
            if len(token) < 2:
                continue

            if token in color:
                score += 3

            if token == size or token in size:
                score += 3

        score += min(stock, 100) / 100

        return score

    def _fallback_products(
        self,
        products: list[dict[str, Any]],
        limit: int,
    ) -> list[dict[str, Any]]:
        fallback_products: list[dict[str, Any]] = []

        for product in products:
            product_with_score = dict(product)
            product_with_score["recommendationScore"] = 1.0
            product_with_score["recommendationReasons"] = [
                "Sản phẩm đang hiển thị và còn hàng trong shop"
            ]
            product_with_score["score"] = 1

            fallback_products.append(product_with_score)

        fallback_products.sort(
            key=lambda item: (
                item.get("available_quantity") or 0,
                item.get("product_id") or 0,
            ),
            reverse=True,
        )

        return self._dedupe_by_product_id(fallback_products, limit)

    def _build_event_score_map(self, events: list[dict[str, Any]]) -> dict[int, float]:
        event_weights = {
            "VIEW": 1,
            "CLICK": 2,
            "SEARCH": 3,
            "ADD_TO_CART": 5,
            "PURCHASE": 10,
        }

        scores: dict[int, float] = {}

        for event in events:
            product_id = self._safe_int(
                self._first_value(event, ["productId", "product_id", "id"])
            )

            if product_id is None:
                continue

            event_type = self._safe_str(
                self._first_value(event, ["eventType", "event_type", "type"])
            ).upper()

            scores[product_id] = scores.get(product_id, 0) + event_weights.get(event_type, 1)

        return scores

    def _build_search_text(self, product: dict[str, Any]) -> str:
        parts = [
            product.get("name"),
            product.get("slug"),
            product.get("brand"),
            product.get("category_name"),
            product.get("color"),
            product.get("size"),
            product.get("searchableText"),
        ]

        return self._normalize_text(" ".join(str(part) for part in parts if part))

    def _tokenize(self, text: str) -> list[str]:
        normalized = self._normalize_text(text)

        return [token for token in normalized.split() if token]

    def _normalize_text(self, value: Any) -> str:
        text = str(value or "").lower().strip()

        replacements = {
            "á": "a",
            "à": "a",
            "ả": "a",
            "ã": "a",
            "ạ": "a",
            "ă": "a",
            "ắ": "a",
            "ằ": "a",
            "ẳ": "a",
            "ẵ": "a",
            "ặ": "a",
            "â": "a",
            "ấ": "a",
            "ầ": "a",
            "ẩ": "a",
            "ẫ": "a",
            "ậ": "a",
            "đ": "d",
            "é": "e",
            "è": "e",
            "ẻ": "e",
            "ẽ": "e",
            "ẹ": "e",
            "ê": "e",
            "ế": "e",
            "ề": "e",
            "ể": "e",
            "ễ": "e",
            "ệ": "e",
            "í": "i",
            "ì": "i",
            "ỉ": "i",
            "ĩ": "i",
            "ị": "i",
            "ó": "o",
            "ò": "o",
            "ỏ": "o",
            "õ": "o",
            "ọ": "o",
            "ô": "o",
            "ố": "o",
            "ồ": "o",
            "ổ": "o",
            "ỗ": "o",
            "ộ": "o",
            "ơ": "o",
            "ớ": "o",
            "ờ": "o",
            "ở": "o",
            "ỡ": "o",
            "ợ": "o",
            "ú": "u",
            "ù": "u",
            "ủ": "u",
            "ũ": "u",
            "ụ": "u",
            "ư": "u",
            "ứ": "u",
            "ừ": "u",
            "ử": "u",
            "ữ": "u",
            "ự": "u",
            "ý": "y",
            "ỳ": "y",
            "ỷ": "y",
            "ỹ": "y",
            "ỵ": "y",
        }

        for source, target in replacements.items():
            text = text.replace(source, target)

        separators = [",", ".", ";", ":", "/", "\\", "-", "_", "(", ")", "[", "]"]

        for separator in separators:
            text = text.replace(separator, " ")

        return " ".join(text.split())

    def _first_value(self, source: dict[str, Any], keys: list[str]) -> Any:
        for key in keys:
            value = source.get(key)

            if value is not None:
                return value

        return None

    def _safe_str(self, value: Any) -> str | None:
        if value is None:
            return None

        text = str(value).strip()

        return text or None

    def _safe_int(self, value: Any) -> int | None:
        if value is None:
            return None

        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _safe_number(self, value: Any) -> float | None:
        if value is None:
            return None

        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _deduplicate_reasons(self, reasons: list[str]) -> list[str]:
        result: list[str] = []
        seen: set[str] = set()

        for reason in reasons:
            if reason in seen:
                continue

            seen.add(reason)
            result.append(reason)

        return result[:4]


recommendation_engine_service = RecommendationEngineService()