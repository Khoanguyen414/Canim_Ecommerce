from typing import Any

from app.schemas.chat_schema import EmotionType, IntentType
from app.services.conversation_state_service import ConversationState


class DialoguePolicyService:
    """
    DialoguePolicyService quyết định widgetType cho frontend.

    ChatService tạo câu trả lời.
    DialoguePolicyService chỉ quyết định UI nên render kiểu nào.
    """

    @staticmethod
    def determine_policy(
        nlu_intent: IntentType,
        nlu_emotion: EmotionType,
        state: ConversationState,
    ) -> dict[str, Any]:
        if nlu_intent == "COMPLAINT" or nlu_emotion == "ANGRY":
            state.bot_status = "NEEDS_HUMAN_ATTENTION"

            return {
                "widgetType": "HUMAN_HANDOFF",
                "quickReplies": [
                    "Tư vấn lại",
                    "Kết nối nhân viên",
                    "Gọi hotline Canim",
                ],
                "should_handoff": True,
                "handoff_reason": "CUSTOMER_DISSATISFIED",
                "debugReason": "Khách không hài lòng, cần ưu tiên hỗ trợ người thật.",
            }

        if nlu_intent == "SIZE_SUGGESTION":
            return {
                "widgetType": "SIZE_ADVICE",
                "quickReplies": [
                    "Mặc vừa vặn",
                    "Mặc rộng thoải mái",
                    "Xem bảng size",
                ],
                "should_handoff": False,
                "handoff_reason": None,
                "debugReason": "Khách hỏi size, không hiển thị sản phẩm.",
            }

        if nlu_intent == "ORDER_TRACKING":
            return {
                "widgetType": "ORDER_LOOKUP",
                "quickReplies": [
                    "Nhập mã đơn",
                    "Kiểm tra đơn khác",
                    "Gặp tổng đài",
                ],
                "should_handoff": False,
                "handoff_reason": None,
                "debugReason": "Khách muốn kiểm tra đơn hàng.",
            }

        if nlu_intent in ["PRODUCT_RECOMMENDATION", "OUTFIT_SUGGESTION"]:
            return {
                "widgetType": "PRODUCT_CAROUSEL",
                "quickReplies": [
                    "Lọc theo màu",
                    "Lọc theo giá",
                    "Đổi phong cách khác",
                ],
                "should_handoff": False,
                "handoff_reason": None,
                "debugReason": "Khách muốn tìm sản phẩm hoặc gợi ý outfit.",
            }

        return {
            "widgetType": "TEXT_ONLY",
            "quickReplies": [
                "Gợi ý outfit",
                "Tư vấn chọn size",
                "Kiểm tra đơn hàng",
            ],
            "should_handoff": False,
            "handoff_reason": None,
            "debugReason": "Chỉ cần trả lời bằng chữ.",
        }


dialogue_policy_service = DialoguePolicyService()