from app.core.config import get_settings
from app.nlu.rule_based_nlu import detect_emotion
from app.schemas.chat_schema import EmotionType


class EmotionService:
    def __init__(self) -> None:
        self.settings = get_settings()
    def classify(self, message: str) -> EmotionType:
        if self.settings.ai_nlu_mode == "rule_based":
            return detect_emotion(message)
        return detect_emotion(message)
emotion_service = EmotionService()
