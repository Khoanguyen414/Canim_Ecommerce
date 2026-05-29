from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


IntentType = Literal[
    "GREETING",                 # Chào hỏi: chào shop, hello, hi
    "PRODUCT_RECOMMENDATION",   # Gợi ý sản phẩm: tìm áo, quần, váy, blazer
    "OUTFIT_SUGGESTION",        # Gợi ý phối đồ: outfit đi làm, đi chơi, tone be
    "SIZE_SUGGESTION",          # Tư vấn size: cao, nặng, mặc size gì
    "ORDER_TRACKING",           # Theo dõi đơn hàng: kiểm tra mã đơn, trạng thái đơn
    "PROMOTION",                # Khuyến mãi: sale, voucher, mã giảm giá
    "SHIPPING_POLICY",          # Giao hàng: ship, phí ship, bao lâu nhận hàng
    "RETURN_POLICY",            # Đổi trả: đổi size, trả hàng, hoàn tiền
    "COMPLAINT",                # Phàn nàn: tào lào, vô tri, trả lời sai
    "THANKS",                   # Cảm ơn: cảm ơn shop, thanks
    "SMALL_TALK",               # Nói chuyện nhẹ: hỏi vui, trò chuyện linh tinh
    "SECURITY_BLOCK",           # Chặn bảo mật: hack, mật khẩu, tấn công hệ thống
    "UNKNOWN",                  # Không xác định được ý định
]


EmotionType = Literal[
    "NEUTRAL",   # Bình thường
    "HAPPY",     # Vui vẻ
    "ANGRY",     # Tức giận, khó chịu
]


WidgetType = Literal[
    "TEXT_ONLY",         # Chỉ trả lời chữ, không hiện sản phẩm
    "PRODUCT_CAROUSEL",  # Hiện danh sách sản phẩm dạng carousel
    "SIZE_ADVICE",       # Hiện tư vấn size
    "ORDER_LOOKUP",      # Hiện luồng kiểm tra đơn hàng
    "HUMAN_HANDOFF",     # Chuyển nhân viên thật
]


class ChatRequest(BaseModel):
    session_id: str = Field(default="default")
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    reply: str
    intent: IntentType = "UNKNOWN"
    emotion: EmotionType = "NEUTRAL"
    widgetType: WidgetType = "TEXT_ONLY"

    entities: Dict[str, Any] = Field(default_factory=dict)
    recommended_products: List[Dict[str, Any]] = Field(default_factory=list)
    quickReplies: List[str] = Field(default_factory=list)

    should_handoff: bool = False
    handoff_reason: Optional[str] = None

    debugReason: Optional[str] = None