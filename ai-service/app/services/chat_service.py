from typing import Any

from app.nlu.rule_based_nlu import rule_based_nlu
from app.schemas.chat_schema import ChatResponse
from app.services.conversation_state_service import conversation_state_service
from app.services.dialogue_policy_service import dialogue_policy_service
from app.services.recommendation_engine_service import recommendation_engine_service


class ChatService:
    def __init__(self) -> None:
        self.recommendation_engine_service = recommendation_engine_service

    def reply(self, message: str, session_id: str = "default") -> ChatResponse:
        nlu = rule_based_nlu.analyze_message(message)
        state = conversation_state_service.get_or_create(session_id)

        self._merge_entities_to_state(state, nlu.entities)
        self._recover_bot_if_customer_changes_topic(state, nlu.intent)

        policy = dialogue_policy_service.determine_policy(
            nlu_intent=nlu.intent,
            nlu_emotion=nlu.emotion,
            state=state,
        )

        reply_message = self._build_reply_message(
            message=message,
            nlu_intent=nlu.intent,
            policy=policy,
            state=state,
        )

        recommended_products = self._build_products(
            message=message,
            widget_type=policy["widgetType"],
        )

        self._update_state_after_reply(
            state=state,
            intent=nlu.intent,
            emotion=nlu.emotion,
            widget_type=policy["widgetType"],
            message=message,
        )

        return ChatResponse(
            reply=reply_message,
            intent=nlu.intent,
            emotion=nlu.emotion,
            widgetType=policy["widgetType"],
            entities=state.collected_entities,
            recommended_products=recommended_products,
            quickReplies=policy["quickReplies"],
            should_handoff=policy["should_handoff"],
            handoff_reason=policy["handoff_reason"],
            debugReason=policy["debugReason"],
        )

    def _merge_entities_to_state(self, state: Any, entities: dict[str, Any]) -> None:
        for key, value in entities.items():
            if value is not None:
                state.collected_entities[key] = value

    def _recover_bot_if_customer_changes_topic(self, state: Any, intent: str) -> None:
        if state.bot_status != "NEEDS_HUMAN_ATTENTION":
            return

        recoverable_intents = [
            "SIZE_SUGGESTION",
            "PRODUCT_RECOMMENDATION",
            "OUTFIT_SUGGESTION",
            "ORDER_TRACKING",
        ]

        if intent in recoverable_intents:
            state.bot_status = "ACTIVE"

    def _build_reply_message(
        self,
        message: str,
        nlu_intent: str,
        policy: dict[str, Any],
        state: Any,
    ) -> str:
        widget_type = policy["widgetType"]

        if widget_type == "HUMAN_HANDOFF":
            return (
                "Dạ Canim xin lỗi Anh/Chị vì phản hồi vừa rồi chưa đúng ý ạ 🙇‍♂️ "
                "Em sẽ dừng gợi ý sản phẩm lại và ưu tiên chuyển cuộc hội thoại này "
                "đến nhân viên hỗ trợ để xử lý chính xác hơn cho mình nha."
            )

        if widget_type == "SIZE_ADVICE":
            return self._build_size_reply(state)

        if widget_type == "ORDER_LOOKUP":
            return self._build_order_reply(state)

        if widget_type == "PRODUCT_CAROUSEL":
            if nlu_intent == "OUTFIT_SUGGESTION":
                return (
                    "Dạ với nhu cầu phối đồ của Anh/Chị, Canim gợi ý một vài item phù hợp nè ✨ "
                    "Mình có thể phối theo tone màu, dịp mặc và phong cách mong muốn để outfit hài hòa hơn ạ."
                )

            return (
                "Dạ đây là một vài gợi ý phù hợp với nhu cầu của Anh/Chị nè ✨ "
                "Anh/Chị muốn em lọc thêm theo màu, size hoặc khoảng giá không ạ?"
            )

        return self._build_text_reply(nlu_intent, state)

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
            return (
                "Dạ yêu cầu này em không thể hỗ trợ vì có thể ảnh hưởng đến bảo mật hệ thống ạ."
            )

        return (
            "Dạ Canim AI Stylist xin chào Anh/Chị ✨ "
            "Em có thể giúp mình tư vấn size, gợi ý outfit, tìm sản phẩm phù hợp "
            "hoặc hỗ trợ kiểm tra đơn hàng ạ."
        )

    def _build_size_reply(self, state: Any) -> str:
        height_cm = state.collected_entities.get("heightCm")
        weight_kg = state.collected_entities.get("weightKg")
        fit_preference = state.collected_entities.get("fitPreference")

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
            f"{', '.join(missing_fields)} của mình nha ạ."
        )

    def _build_fit_note(self, fit_preference: str | None) -> str:
        if fit_preference == "OVERSIZE":
            return (
                "Vì mình thích mặc rộng/oversize, Anh/Chị có thể cân nhắc tăng lên 1 size "
                "để form thoải mái hơn nha."
            )

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

    def _build_products(self, message: str, widget_type: str) -> list[dict[str, Any]]:
        if widget_type != "PRODUCT_CAROUSEL":
            return []

        try:
            result = self.recommendation_engine_service.recommend_contextual(
                message=message,
                user_id=None,
                limit=5,
            )

            return self._normalize_products(result)
        except Exception:
            return []

    def _normalize_products(self, result: Any) -> list[dict[str, Any]]:
        if isinstance(result, list):
            return [item for item in result if isinstance(item, dict)]

        if isinstance(result, dict):
            items = result.get("items") or result.get("products") or []

            if isinstance(items, list):
                return [item for item in items if isinstance(item, dict)]

        items = getattr(result, "items", None)

        if isinstance(items, list):
            return [item for item in items if isinstance(item, dict)]

        return []

    def _update_state_after_reply(
        self,
        state: Any,
        intent: str,
        emotion: str,
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