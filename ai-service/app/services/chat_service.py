from typing import Any

from app.nlu.rule_based_nlu import rule_based_nlu
from app.schemas.chat_schema import ChatResponse, EmotionType, IntentType
from app.services.conversation_state_service import conversation_state_service
from app.services.dialogue_policy_service import dialogue_policy_service
from app.services.recommendation_engine_service import recommendation_engine_service


class ChatService:
    """
    Canim AI chat orchestration layer.

    Clean logic:
    - NLU decides the first intent.
    - ChatService adds business guardrails for fashion/product domain.
    - Product suggestions are filtered by product family so "giày" does not return "dép".
    - Size guidance is product-type aware:
      + Clothes: S/M/L/XL by height and weight.
      + Shoes/slippers: foot sizes 36-43.
      + Rings: ring sizes 6-12.
      + Hats: Free size / head circumference.
      + Ties/accessories: usually Free size or no clothing size.
    """

    TOPIC_CHANGE_INTENTS = [
        "GREETING",
        "THANKS",
        "SIZE_SUGGESTION",
        "PRODUCT_RECOMMENDATION",
        "OUTFIT_SUGGESTION",
        "ORDER_TRACKING",
        "PROMOTION",
        "SHIPPING_POLICY",
        "RETURN_POLICY",
    ]

    SIZE_GUIDE_SIGNALS = [
        "size",
        "kich co",
        "chon size",
        "tu van size",
        "co chan",
        "so chan",
        "size chan",
        "size giay",
        "size dep",
        "co nhan",
        "size nhan",
        "duong kinh",
        "ngon tay",
        "vong dau",
        "chon nhu the nao",
        "chon the nao",
        "phu hop",
        "hop voi",
    ]

    FAMILY_LABELS = {
        "SHOES": "giày",
        "SLIPPERS": "dép/sandal",
        "FOOTWEAR": "giày/dép",
        "RING": "nhẫn",
        "HAT": "mũ/nón",
        "TIE": "cà vạt",
        "NECKLACE": "vòng cổ/dây chuyền",
        "WATCH": "đồng hồ",
        "BRACELET": "vòng tay",
        "ACCESSORY": "phụ kiện",
        "TOP": "áo",
        "BOTTOM": "quần",
        "GENERAL": "sản phẩm",
    }

    def __init__(self) -> None:
        self.recommendation_engine_service = recommendation_engine_service

    def reply(self, message: str, session_id: str = "default") -> ChatResponse:
        nlu = rule_based_nlu.analyze_message(message)
        state = conversation_state_service.get_or_create(session_id)

        resolved_intent = self._resolve_intent(
            nlu_intent=nlu.intent,
            entities=nlu.entities,
            state=state,
            message=message,
        )

        self._merge_entities_to_state(state, nlu.entities)
        self._recover_bot_if_customer_changes_topic(state, resolved_intent)

        policy = dialogue_policy_service.determine_policy(
            nlu_intent=resolved_intent,
            nlu_emotion=nlu.emotion,
            state=state,
        )

        widget_type = policy["widgetType"]

        recommended_products: list[dict[str, Any]] = []
        if widget_type == "PRODUCT_CAROUSEL":
            recommended_products = self._build_products(message=message)

        reply_message = self._build_reply_message(
            nlu_intent=resolved_intent,
            policy=policy,
            state=state,
            recommended_products=recommended_products,
            fit_preference_without_context=self._is_fit_preference_without_context(
                nlu.entities,
                resolved_intent,
            ),
            user_message=message,
        )

        self._update_state_after_reply(
            state=state,
            intent=resolved_intent,
            emotion=nlu.emotion,
            widget_type=widget_type,
            message=message,
        )

        return ChatResponse(
            reply=reply_message,
            intent=resolved_intent,
            emotion=nlu.emotion,
            widgetType=widget_type,
            entities=state.collected_entities,
            recommended_products=recommended_products,
            quickReplies=policy["quickReplies"],
            should_handoff=policy["should_handoff"],
            handoff_reason=policy["handoff_reason"],
            debugReason=policy["debugReason"],
        )

    def _resolve_intent(
        self,
        nlu_intent: IntentType,
        entities: dict[str, Any],
        state: Any,
        message: str,
    ) -> IntentType:
        text = self._normalize_user_text(message)

        if nlu_intent == "SECURITY_BLOCK":
            return "SECURITY_BLOCK"

        # Product-specific size questions must be handled before complaint/handoff.
        # Example: "đưa size phù hợp cỡ chân của dép" contains "cỡ" but is not a complaint.
        if self._is_product_size_guide_message(message):
            return "SIZE_SUGGESTION"

        if nlu_intent == "SIZE_SUGGESTION":
            return "SIZE_SUGGESTION"

        # Product search must be handled before greeting/unknown.
        # Example: "tìm cà vạt" and "cà vạt" must not fall back to greeting.
        if self._has_product_family_signal(message):
            return "PRODUCT_RECOMMENDATION"

        if nlu_intent in [
            "COMPLAINT",
            "ORDER_TRACKING",
            "PRODUCT_RECOMMENDATION",
            "OUTFIT_SUGGESTION",
            "PROMOTION",
            "SHIPPING_POLICY",
            "RETURN_POLICY",
            "THANKS",
            "GREETING",
        ]:
            return nlu_intent

        if rule_based_nlu.is_fit_preference_only(text, entities):
            if state.last_intent == "SIZE_SUGGESTION":
                return "SIZE_SUGGESTION"

            return "UNKNOWN"

        if state.last_intent == "SIZE_SUGGESTION" and (
            entities.get("heightCm") is not None
            or entities.get("weightKg") is not None
            or entities.get("fitPreference") is not None
            or rule_based_nlu.is_measurement_followup(message)
        ):
            return "SIZE_SUGGESTION"

        return nlu_intent

    def _is_fit_preference_without_context(
        self,
        entities: dict[str, Any],
        resolved_intent: IntentType,
    ) -> bool:
        return bool(
            entities.get("fitPreference")
            and resolved_intent == "UNKNOWN"
        )

    def _merge_entities_to_state(self, state: Any, entities: dict[str, Any]) -> None:
        for key, value in entities.items():
            if value is not None:
                state.collected_entities[key] = value

    def _recover_bot_if_customer_changes_topic(self, state: Any, intent: str) -> None:
        if state.bot_status != "NEEDS_HUMAN_ATTENTION":
            return

        if intent in self.TOPIC_CHANGE_INTENTS:
            state.bot_status = "ACTIVE"

    # ---------------------------------------------------------------------
    # Product family detection and product filtering
    # ---------------------------------------------------------------------

    def _normalize_user_text(self, value: str) -> str:
        return rule_based_nlu._normalize_text(value or "")

    def _detect_product_family(self, message: str) -> str:
        text = self._normalize_user_text(message)

        # User asks generally for both shoes and slippers.
        if any(keyword in text for keyword in ["giay dep", "dep giay"]):
            return "FOOTWEAR"

        # Separate shoes and slippers for cleaner recommendations.
        if "giay" in text:
            return "SHOES"

        if any(keyword in text for keyword in ["dep", "sandal"]):
            return "SLIPPERS"

        if "nhan" in text:
            return "RING"

        if any(keyword in text for keyword in ["mu", "non", "bucket", "golf"]):
            return "HAT"

        if any(keyword in text for keyword in ["ca vat", "caravat", "cravat"]):
            return "TIE"

        if any(keyword in text for keyword in ["vong co", "day chuyen"]):
            return "NECKLACE"

        if "dong ho" in text:
            return "WATCH"

        if "vong tay" in text:
            return "BRACELET"

        if any(keyword in text for keyword in ["ao", "hoodie", "hoodi", "thun", "so mi", "khoac"]):
            return "TOP"

        if any(keyword in text for keyword in ["quan", "jeans", "jean", "jogger"]):
            return "BOTTOM"

        return "GENERAL"

    def _has_product_family_signal(self, message: str) -> bool:
        return self._detect_product_family(message) != "GENERAL"

    def _is_product_size_guide_message(self, message: str) -> bool:
        text = self._normalize_user_text(message)
        family = self._detect_product_family(message)

        if any(signal in text for signal in self.SIZE_GUIDE_SIGNALS):
            return True

        # "cỡ nhẫn", "cỡ chân", "vòng cổ chọn như thế nào" are size/fit questions.
        if family in ["SHOES", "SLIPPERS", "FOOTWEAR", "RING", "HAT", "TIE", "NECKLACE", "WATCH", "BRACELET"]:
            return any(
                keyword in text
                for keyword in [
                    "co ",
                    "chon",
                    "phu hop",
                    "hop",
                    "kich thuoc",
                    "do dai",
                    "duong kinh",
                ]
            )

        return False

    def _product_text(self, product: dict[str, Any]) -> str:
        category = product.get("categoryName") or product.get("category_name") or product.get("category") or ""

        if isinstance(category, dict):
            category = category.get("name") or category.get("slug") or ""

        fields = [
            product.get("name", ""),
            product.get("slug", ""),
            product.get("shortDesc", ""),
            product.get("short_desc", ""),
            product.get("longDesc", ""),
            product.get("long_desc", ""),
            category,
        ]

        return self._normalize_user_text(" ".join(str(item or "") for item in fields))

    def _product_matches_family(self, product: dict[str, Any], family: str) -> bool:
        if family == "GENERAL":
            return True

        text = self._product_text(product)

        if family == "SHOES":
            return "giay" in text

        if family == "SLIPPERS":
            return any(keyword in text for keyword in ["dep", "sandal"])

        if family == "FOOTWEAR":
            return any(keyword in text for keyword in ["giay", "dep", "sandal"])

        if family == "RING":
            return "nhan" in text

        if family == "HAT":
            return any(keyword in text for keyword in ["mu", "non", "bucket", "golf"])

        if family == "TIE":
            return any(keyword in text for keyword in ["ca vat", "caravat", "cravat"])

        if family == "NECKLACE":
            return any(keyword in text for keyword in ["vong co", "day chuyen"])

        if family == "WATCH":
            return "dong ho" in text

        if family == "BRACELET":
            return "vong tay" in text

        if family == "ACCESSORY":
            return any(keyword in text for keyword in ["dong ho", "vong tay", "vong co", "day chuyen", "ca vat"])

        if family == "TOP":
            return any(keyword in text for keyword in ["ao", "hoodie", "hoodi", "thun", "so mi", "khoac"])

        if family == "BOTTOM":
            return any(keyword in text for keyword in ["quan", "jeans", "jean", "jogger"])

        return True

    def _filter_products_by_family(
        self,
        products: list[dict[str, Any]],
        message: str,
        limit: int,
    ) -> list[dict[str, Any]]:
        family = self._detect_product_family(message)

        if family == "GENERAL":
            return products[:limit]

        filtered = [
            product
            for product in products
            if self._product_matches_family(product, family)
        ]

        # Important: do not refill with unrelated products.
        # If customer asks for "cà vạt", returning one tie is better than adding slippers.
        return filtered[:limit]

    # ---------------------------------------------------------------------
    # Reply builders
    # ---------------------------------------------------------------------

    def _build_reply_message(
        self,
        nlu_intent: str,
        policy: dict[str, Any],
        state: Any,
        recommended_products: list[dict[str, Any]],
        fit_preference_without_context: bool = False,
        user_message: str = "",
    ) -> str:
        widget_type = policy["widgetType"]

        if fit_preference_without_context:
            return (
                "Dạ mình muốn tư vấn size cho sản phẩm nào ạ? "
                "Anh/Chị cho em chiều cao và cân nặng để em tư vấn chuẩn hơn nha."
            )

        if widget_type == "HUMAN_HANDOFF":
            return (
                "Dạ Canim xin lỗi Anh/Chị vì phản hồi vừa rồi chưa đúng ý ạ 🙇‍♂️ "
                "Em sẽ dừng gợi ý sản phẩm lại và ưu tiên chuyển cuộc hội thoại này "
                "đến nhân viên hỗ trợ để xử lý chính xác hơn cho mình nha."
            )

        if widget_type == "SIZE_ADVICE":
            return self._build_size_reply(state, nlu_intent, user_message)

        if widget_type == "ORDER_LOOKUP":
            return self._build_order_reply(state)

        if widget_type == "PRODUCT_CAROUSEL":
            return self._build_product_reply(
                nlu_intent=nlu_intent,
                recommended_products=recommended_products,
                user_message=user_message,
            )

        return self._build_text_reply(nlu_intent, state)

    def _build_product_reply(
        self,
        nlu_intent: str,
        recommended_products: list[dict[str, Any]],
        user_message: str = "",
    ) -> str:
        family = self._detect_product_family(user_message)
        product_label = self.FAMILY_LABELS.get(family, "")

        if not recommended_products:
            if nlu_intent == "OUTFIT_SUGGESTION":
                return (
                    "Dạ em hiểu Anh/Chị đang muốn gợi ý outfit ạ ✨ "
                    "Tuy nhiên hiện dữ liệu sản phẩm phù hợp trong shop chưa đủ để em ghép outfit chính xác. "
                    "Anh/Chị có thể thử mô tả sát hơn như áo thun, giày, màu be, size M hoặc khoảng giá mong muốn nha."
                )

            if family != "GENERAL":
                return (
                    f"Dạ em hiểu Anh/Chị đang muốn tìm {product_label} ạ ✨ "
                    f"Tuy nhiên hiện em chưa tìm thấy sản phẩm {product_label} phù hợp trong shop. "
                    "Anh/Chị thử đổi màu, khoảng giá hoặc tên sản phẩm khác giúp em nha."
                )

            query_label = self._extract_product_query_label_safely(user_message)
            if query_label:
                return (
                    f"Dạ em hiểu Anh/Chị đang muốn tìm {query_label} ạ ✨ "
                    f"Tuy nhiên hiện em chưa tìm thấy sản phẩm {query_label} phù hợp trong shop. "
                    "Anh/Chị thử mô tả rõ hơn tên sản phẩm, màu, size hoặc khoảng giá giúp em nha."
                )

            return (
                "Dạ em hiểu Anh/Chị đang muốn tìm sản phẩm ạ ✨ "
                "Tuy nhiên hiện em chưa tìm thấy sản phẩm phù hợp trong dữ liệu shop. "
                "Anh/Chị thử nhập rõ hơn tên sản phẩm, màu, size hoặc khoảng giá giúp em nha."
            )

        if nlu_intent == "OUTFIT_SUGGESTION":
            return (
                "Dạ với nhu cầu phối đồ của Anh/Chị, Canim gợi ý một vài item phù hợp nè ✨ "
                "Mình có thể phối theo tone màu, dịp mặc và phong cách mong muốn để outfit hài hòa hơn ạ."
            )

        family_reply = self._build_product_family_reply(family)
        if family_reply:
            return family_reply

        return (
            "Dạ đây là một vài gợi ý phù hợp với nhu cầu của Anh/Chị nè ✨ "
            "Anh/Chị muốn em lọc thêm theo màu, size hoặc khoảng giá không ạ?"
        )

    def _build_product_family_reply(self, family: str) -> str:
        if family == "SHOES":
            return (
                "Dạ em tìm thấy một số mẫu giày phù hợp nè ✨ "
                "Với giày, Anh/Chị nên chọn theo số chân như 36, 37, 38, 39, 40, 41, 42, 43 để mang vừa hơn ạ."
            )

        if family == "SLIPPERS":
            return (
                "Dạ em tìm thấy một số mẫu dép/sandal phù hợp nè ✨ "
                "Với dép, Anh/Chị nên chọn theo số chân như 36, 37, 38, 39, 40, 41, 42, 43 để mang thoải mái hơn ạ."
            )

        if family == "FOOTWEAR":
            return (
                "Dạ em tìm thấy một số mẫu giày/dép phù hợp nè ✨ "
                "Anh/Chị nên chọn theo số chân như 36, 37, 38, 39, 40, 41, 42, 43 để mang vừa hơn ạ."
            )

        if family == "RING":
            return (
                "Dạ em tìm thấy một số mẫu nhẫn phù hợp nè ✨ "
                "Với nhẫn, Anh/Chị nên chọn theo size ngón tay hoặc đường kính nhẫn để đeo vừa hơn ạ."
            )

        if family == "HAT":
            return (
                "Dạ em tìm thấy một số mẫu mũ phù hợp nè ✨ "
                "Với mũ, Anh/Chị có thể chọn Free size hoặc kiểm tra vòng đầu khoảng 56–58cm ạ."
            )

        if family == "TIE":
            return (
                "Dạ em tìm thấy một số mẫu cà vạt phù hợp nè ✨ "
                "Cà vạt thường không cần size, Anh/Chị có thể chọn theo màu, chất liệu hoặc phong cách phối đồ ạ."
            )

        if family == "NECKLACE":
            return (
                "Dạ em tìm thấy một số mẫu vòng cổ/dây chuyền phù hợp nè ✨ "
                "Phụ kiện này thường chọn theo kiểu dáng, màu sắc hoặc chiều dài, không dùng size áo quần ạ."
            )

        if family == "WATCH":
            return (
                "Dạ em tìm thấy một số mẫu đồng hồ phù hợp nè ✨ "
                "Đồng hồ thường chọn theo kiểu mặt, màu dây và kích thước cổ tay, không dùng size áo quần ạ."
            )

        if family == "BRACELET":
            return (
                "Dạ em tìm thấy một số mẫu vòng tay phù hợp nè ✨ "
                "Vòng tay thường chọn theo kiểu dáng hoặc kích thước cổ tay, không dùng size áo quần ạ."
            )

        return ""

    def _build_text_reply(self, intent: str, state: Any) -> str:
        if intent == "GREETING" and state.last_intent in ["SIZE_SUGGESTION", "COMPLAINT"]:
            return (
                "Dạ em chào Anh/Chị ạ. Em vừa hỗ trợ mình ở phần trước, "
                "không biết mình muốn em tư vấn lại kỹ hơn hay chuyển sang gợi ý sản phẩm phù hợp ạ?"
            )

        if intent == "GREETING":
            return (
                "Dạ Canim xin chào Anh/Chị ✨ "
                "Em có thể giúp mình tư vấn size, gợi ý outfit, tìm sản phẩm phù hợp "
                "hoặc hỗ trợ kiểm tra đơn hàng ạ."
            )

        if intent == "THANKS":
            return (
                "Dạ Canim cảm ơn Anh/Chị nhiều ạ 😊 "
                "Nếu cần tư vấn thêm size, outfit hoặc sản phẩm phù hợp thì cứ nhắn em nha."
            )

        if intent == "SHIPPING_POLICY":
            return (
                "Dạ về giao hàng, Canim sẽ hỗ trợ giao theo khu vực và phương thức vận chuyển hiện có ạ. "
                "Anh/Chị cho em biết mình ở tỉnh/thành nào để em tư vấn thời gian giao dự kiến chính xác hơn nha."
            )

        if intent == "RETURN_POLICY":
            return (
                "Dạ Canim có hỗ trợ đổi trả theo chính sách của shop ạ. "
                "Nếu mình cần đổi size hoặc đổi sản phẩm, Anh/Chị cho em biết mã đơn và tình trạng sản phẩm để em hỗ trợ tiếp nha."
            )

        if intent == "PROMOTION":
            return (
                "Dạ Anh/Chị muốn xem khuyến mãi hiện có đúng không ạ? "
                "Em có thể gợi ý sản phẩm đang hot hoặc lọc theo khoảng giá mình mong muốn nha."
            )

        if intent == "SECURITY_BLOCK":
            return "Dạ yêu cầu này em không thể hỗ trợ vì có thể ảnh hưởng đến bảo mật hệ thống ạ."

        return (
            "Dạ Canim AI Stylist xin chào Anh/Chị ✨ "
            "Em có thể giúp mình tư vấn size, gợi ý outfit, tìm sản phẩm phù hợp "
            "hoặc hỗ trợ kiểm tra đơn hàng ạ."
        )

    def _build_size_reply(self, state: Any, nlu_intent: str, user_message: str = "") -> str:
        family = self._detect_product_family(user_message)

        if family in ["SHOES", "SLIPPERS", "FOOTWEAR"]:
            return self._build_footwear_size_reply(family)

        if family == "RING":
            return self._build_ring_size_reply()

        if family == "HAT":
            return self._build_hat_size_reply()

        if family == "TIE":
            return (
                "Dạ cà vạt thường không cần size như áo quần ạ 👔\n"
                "Mình nên chọn theo màu sắc, chất liệu, độ rộng bản cà vạt và phong cách phối đồ. "
                "Trong hệ thống có thể để size là Free size cho cà vạt."
            )

        if family == "NECKLACE":
            return (
                "Dạ với vòng cổ/dây chuyền, mình nên chọn theo chiều dài hoặc kiểu dáng ạ ✨\n"
                "- Dây ngắn: hợp phối áo cổ tròn/cổ tim.\n"
                "- Dây trung bình: dễ dùng hằng ngày.\n"
                "- Dây dài: hợp phối layer hoặc outfit cá tính.\n\n"
                "Nếu shop chưa quản lý chiều dài chi tiết thì có thể để Free size, không nên dùng S/M/L như áo quần."
            )

        if family in ["WATCH", "BRACELET", "ACCESSORY"]:
            return (
                "Dạ với phụ kiện như đồng hồ/vòng tay, mình nên chọn theo kiểu dáng, màu sắc "
                "hoặc kích thước cổ tay ạ. Nếu chưa có thông số chi tiết, shop có thể để Free size."
            )

        height_cm = state.collected_entities.get("heightCm")
        weight_kg = state.collected_entities.get("weightKg")
        fit_preference = state.collected_entities.get("fitPreference")

        if fit_preference and nlu_intent == "SIZE_SUGGESTION" and height_cm and weight_kg:
            recommended_size = state.collected_entities.get("recommendedSize")
            if not recommended_size:
                recommended_size = self._recommend_size(height_cm, weight_kg)
                state.collected_entities["recommendedSize"] = recommended_size

            fit_note = self._build_fit_note(fit_preference)
            state.collected_entities["fitNote"] = fit_note

            return (
                f"Dạ em ghi nhận mình thích mặc {'rộng/oversize' if fit_preference == 'OVERSIZE' else 'vừa vặn'} ạ. "
                f"Với chiều cao {height_cm}cm và cân nặng {weight_kg}kg, "
                f"Canim vẫn gợi ý Size {recommended_size} là cơ sở. {fit_note}"
            )

        if height_cm and weight_kg:
            recommended_size = self._recommend_size(height_cm, weight_kg)
            state.collected_entities["recommendedSize"] = recommended_size

            if recommended_size == "UNKNOWN":
                return (
                    f"Dạ số đo {height_cm}cm và {weight_kg}kg của mình hơi nằm ngoài bảng size chuẩn. "
                    "Anh/Chị cho em biết mình thích mặc vừa người hay rộng thoải mái để em tư vấn sát hơn nha."
                )

            fit_note = self._build_fit_note(fit_preference)
            state.collected_entities["fitNote"] = fit_note

            return (
                f"Dạ với chiều cao {height_cm}cm và cân nặng {weight_kg}kg, "
                f"Canim gợi ý mình mặc Size {recommended_size} sẽ hợp lý nhất ạ 😊. "
                f"{fit_note} Mình thích mặc vừa người hay rộng thoải mái hơn ạ?"
            )

        missing_fields = []

        if not height_cm:
            missing_fields.append("chiều cao")

        if not weight_kg:
            missing_fields.append("cân nặng")

        return (
            "Dạ để em tư vấn size chính xác nhất, Anh/Chị cho em xin thêm "
            f"{', '.join(missing_fields)} của mình nha ạ. "
            "Nếu mình hỏi giày/dép/nhẫn/mũ/phụ kiện thì có thể nhắn rõ loại sản phẩm, em sẽ gửi bảng size riêng."
        )

    def _build_footwear_size_reply(self, family: str) -> str:
        label = "giày/dép"
        emoji = "👣"
        note = "Admin nên cập nhật lại size giày/dép sang 36–43 để đúng nghiệp vụ ạ."

        if family == "SHOES":
            label = "giày"
            emoji = "👟"
            note = "Nếu sản phẩm giày đang hiện S/M/L thì admin nên cập nhật lại variant sang size 36–43 ạ."

        if family == "SLIPPERS":
            label = "dép/sandal"
            emoji = "👣"
            note = "Dép nên chọn hơi thoải mái hơn một chút nếu Anh/Chị thích mang rộng ạ."

        return (
            f"Dạ với {label}, mình nên chọn theo số chân thay vì S/M/L ạ {emoji}\n"
            "- Size 36: chân khoảng 22.5–23cm\n"
            "- Size 37: chân khoảng 23–23.5cm\n"
            "- Size 38: chân khoảng 24cm\n"
            "- Size 39: chân khoảng 24.5cm\n"
            "- Size 40: chân khoảng 25cm\n"
            "- Size 41: chân khoảng 25.5–26cm\n"
            "- Size 42: chân khoảng 26.5cm\n"
            "- Size 43: chân khoảng 27–27.5cm\n\n"
            f"{note}"
        )

    def _build_ring_size_reply(self) -> str:
        return (
            "Dạ với nhẫn, mình nên chọn theo size ngón tay hoặc đường kính nhẫn ạ 💍\n"
            "- Size 6: đường kính khoảng 16.5mm\n"
            "- Size 7: khoảng 17.3mm\n"
            "- Size 8: khoảng 18.1mm\n"
            "- Size 9: khoảng 18.9mm\n"
            "- Size 10: khoảng 19.8mm\n"
            "- Size 11: khoảng 20.6mm\n"
            "- Size 12: khoảng 21.4mm\n\n"
            "Nhẫn không nên dùng size áo quần như S/M/L nếu không có bảng quy đổi riêng."
        )

    def _build_hat_size_reply(self) -> str:
        return (
            "Dạ với mũ/nón, thường có thể dùng Free size hoặc chọn theo vòng đầu ạ 🧢\n"
            "- Free size: phù hợp đa số người dùng\n"
            "- 56cm: đầu nhỏ\n"
            "- 57cm: trung bình\n"
            "- 58cm: hơi lớn\n\n"
            "Nếu admin tạo sản phẩm mũ thì nên dùng Free size, 56cm, 57cm hoặc 58cm."
        )

    def _build_fit_note(self, fit_preference: str | None) -> str:
        if fit_preference == "OVERSIZE":
            return (
                "Vì mình thích mặc rộng/oversize, Anh/Chị có thể cân nhắc tăng lên 1 size "
                "để form thoải mái hơn nha."
            )

        if fit_preference == "REGULAR":
            return "Với form vừa vặn, Anh/Chị có thể giữ size gợi ý nha."

        return (
            "Nếu mình thích mặc rộng rãi hoặc oversize hơn, "
            "có thể cân nhắc tăng lên 1 size nha."
        )

    def _build_order_reply(self, state: Any) -> str:
        order_code = state.collected_entities.get("orderCode")

        if order_code:
            return (
                f"Dạ em đã ghi nhận mã đơn {order_code}. "
                "Hiện em cần kết nối dữ liệu đơn hàng từ backend để kiểm tra trạng thái chính xác cho mình ạ."
            )

        return (
            "Dạ Anh/Chị cho em xin mã đơn hàng, ví dụ ORD-1234, "
            "để em hỗ trợ kiểm tra trạng thái đơn nhanh hơn ạ."
        )

    # ---------------------------------------------------------------------
    # Recommendation engine adapter
    # ---------------------------------------------------------------------

    def _build_products(self, message: str) -> list[dict[str, Any]]:
        return self._recommend_products_safely(
            message=message,
            limit=5,
            source="primary",
        )

    def _recommend_products_safely(
        self,
        message: str,
        limit: int,
        source: str,
    ) -> list[dict[str, Any]]:
        try:
            result = self.recommendation_engine_service.recommend_contextual(
                message=message,
                user_id=None,
                limit=limit,
            )

            products = self._normalize_products(result)
            products = self._filter_products_by_family(
                products=products,
                message=message,
                limit=limit,
            )

            print(
                f"[Canim AI] recommendation source={source}, "
                f"query={message!r}, family={self._detect_product_family(message)}, count={len(products)}"
            )

            return products
        except Exception as exception:
            print(
                f"[Canim AI] recommendation error source={source}, "
                f"query={message!r}, error={exception!r}"
            )

            return []

    def _normalize_products(self, result: Any) -> list[dict[str, Any]]:
        if isinstance(result, list):
            return [item for item in result if isinstance(item, dict)]

        if isinstance(result, dict):
            items = result.get("items") or result.get("products") or result.get("recommended_products") or []

            if isinstance(items, list):
                return [item for item in items if isinstance(item, dict)]

        items = getattr(result, "items", None)

        if isinstance(items, list):
            return [item for item in items if isinstance(item, dict)]

        products = getattr(result, "products", None)

        if isinstance(products, list):
            return [item for item in products if isinstance(item, dict)]

        return []

    def _extract_product_query_label_safely(self, message: str) -> str | None:
        try:
            return self.recommendation_engine_service.extract_product_query_label(message)
        except Exception:
            return None

    # ---------------------------------------------------------------------
    # State and clothing size helpers
    # ---------------------------------------------------------------------

    def _update_state_after_reply(
        self,
        state: Any,
        intent: str,
        emotion: EmotionType,
        widget_type: str,
        message: str,
    ) -> None:
        state.last_intent = intent
        state.last_emotion = emotion
        state.last_widget_type = widget_type
        state.last_user_message = message

    def _recommend_size(self, height_cm: int, weight_kg: int) -> str:
        height_size = self._size_by_height(height_cm)
        weight_size = self._size_by_weight(weight_kg)

        size_order = ["S", "M", "L", "XL"]

        if height_size == "UNKNOWN" and weight_size == "UNKNOWN":
            return "UNKNOWN"

        if height_size == "UNKNOWN":
            return weight_size

        if weight_size == "UNKNOWN":
            return height_size

        return max(
            height_size,
            weight_size,
            key=lambda size: size_order.index(size),
        )

    def _size_by_height(self, height_cm: int) -> str:
        if 150 <= height_cm <= 160:
            return "S"

        if 161 <= height_cm <= 170:
            return "M"

        if 171 <= height_cm <= 178:
            return "L"

        if 179 <= height_cm <= 185:
            return "XL"

        return "UNKNOWN"

    def _size_by_weight(self, weight_kg: int) -> str:
        if 45 <= weight_kg <= 52:
            return "S"

        if 53 <= weight_kg <= 60:
            return "M"

        if 61 <= weight_kg <= 68:
            return "L"

        if 69 <= weight_kg <= 78:
            return "XL"

        return "UNKNOWN"


chat_service = ChatService()
