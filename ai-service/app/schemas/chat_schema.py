from typing import Literal, Optional

from pydantic import BaseModel, Field


IntentType = Literal[
    "GREETING",
    "PRODUCT_RECOMMENDATION",
    "OUTFIT_SUGGESTION",
    "SIZE_SUGGESTION",
    "ORDER_TRACKING",
    "PROMOTION",
    "SHIPPING_POLICY",
    "RETURN_POLICY",
    "COMPLAINT",
    "THANKS",
    "SMALL_TALK",
    "SECURITY_BLOCK",
    "UNKNOWN",
]


INTENT_VI_LABELS: dict[str, str] = {
    "GREETING": "Khách chào shop",
    "PRODUCT_RECOMMENDATION": "Khách muốn tìm hoặc mua sản phẩm",
    "OUTFIT_SUGGESTION": "Khách muốn phối đồ hoặc gợi ý outfit",
    "SIZE_SUGGESTION": "Khách hỏi size hoặc bảng size",
    "ORDER_TRACKING": "Khách muốn kiểm tra đơn hàng",
    "PROMOTION": "Khách hỏi khuyến mãi, voucher hoặc sale",
    "SHIPPING_POLICY": "Khách hỏi giao hàng hoặc phí ship",
    "RETURN_POLICY": "Khách hỏi đổi trả, đổi size hoặc hoàn hàng",
    "COMPLAINT": "Khách phàn nàn hoặc khiếu nại",
    "THANKS": "Khách cảm ơn",
    "SMALL_TALK": "Khách nói chuyện vui hoặc khen shop",
    "SECURITY_BLOCK": "Câu hỏi nguy hiểm hoặc liên quan bảo mật",
    "UNKNOWN": "AI chưa hiểu rõ ý định",
}


EmotionType = Literal[
    "FRIENDLY",
    "NEUTRAL",
    "HAPPY",
    "THANKS",
    "CONFUSED",
    "COMPLAINT",
    "ANGRY",
]


EMOTION_VI_LABELS: dict[str, str] = {
    "FRIENDLY": "Khách thân thiện hoặc chào hỏi",
    "NEUTRAL": "Cảm xúc trung lập",
    "HAPPY": "Khách vui vẻ",
    "THANKS": "Khách cảm ơn",
    "CONFUSED": "Khách đang bối rối hoặc chưa hiểu",
    "COMPLAINT": "Khách đang phàn nàn",
    "ANGRY": "Khách đang tức giận mạnh",
}


class ChatRequest(BaseModel):
    session_id: str = Field(
        ...,
        min_length=1,
        description="Mã phiên chat của khách hàng",
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Tin nhắn khách hàng gửi vào chatbot",
    )


class ProductSuggestionResponse(BaseModel):
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    sku: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    brand: Optional[str] = None
    category_name: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    available_quantity: Optional[int] = None
    image_url: Optional[str] = None
    score: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    intent: IntentType
    emotion: EmotionType

    recommended_products: list[ProductSuggestionResponse] = Field(
        default_factory=list
    )

    should_handoff: bool = False
    handoff_reason: Optional[str] = None