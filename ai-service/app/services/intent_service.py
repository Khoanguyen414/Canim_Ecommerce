from app.core.config import get_settings
from app.nlu.ml_nlu import ml_nlu_service
from app.nlu.rule_based_nlu import detect_intent
from app.schemas.chat_schema import IntentType


class IntentService:
    def __init__(self) -> None:
        self.settings = get_settings()
    def classify(self, message: str) -> IntentType:
        if self.settings.ai_nlu_mode == "ml":
            return ml_nlu_service.predict_intent(message)

        if self.settings.ai_nlu_mode == "rule_based":
            return detect_intent(message)

        return detect_intent(message)


intent_service = IntentService()

