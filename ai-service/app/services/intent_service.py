from app.core.config import get_settings
from app.nlu.rule_based_nlu import detect_intent
from app.schemas.chat_schema import IntentType


class IntentService:
    def __init__(self) -> None:
        self.settings = get_settings()
    def classify(self, message: str) -> IntentType:
        if self.settings.ai_nlu_mode == "rule_based":
            return detect_intent(message)
        return detect_intent(message)
       #intentlà ý định, classify là phân loại ý định của khách hàng dựa trên nội dung tin nhắn.

intent_service = IntentService()
