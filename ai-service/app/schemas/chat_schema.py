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

EmotionType = Literal[
    "FRIENDLY",
    "NEUTRAL",
    "HAPPY",
    "THANKS",
    "CONFUSED",
    "COMPLAINT",
    "ANGRY",
]

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
class ChatResponse(BaseModel):
    reply: str
    intent: IntentType
    emotion: EmotionType
    should_handoff: bool = False
    handoff_reason: Optional[str] = None
   