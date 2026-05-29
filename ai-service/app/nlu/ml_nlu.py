from pathlib import Path
from typing import Optional

import joblib

from app.nlu.rule_based_nlu import detect_emotion, detect_intent
from app.schemas.chat_schema import EmotionType, IntentType

DEFAULT_MODEL_DIR = Path("models")
INTENT_MODEL_FILENAME = "intent_classifier.joblib"
EMOTION_MODEL_FILENAME = "emotion_classifier.joblib"

class MlNluService:
    def __init__(self, model_dir: Path = DEFAULT_MODEL_DIR) -> None:
        self.model_dir = model_dir
        self.intent_model = self._load_model(INTENT_MODEL_FILENAME)
        self.emotion_model = self._load_model(EMOTION_MODEL_FILENAME)

    def _load_model(self, filename: str) -> Optional[object]:
        model_path = self.model_dir / filename
        if not model_path.exists():
            return None

        try:
            return joblib.load(model_path)
        except Exception:
            return None

    def predict_intent(self, message: str) -> IntentType:
        if self.intent_model is None:
            return detect_intent(message)

        prediction = self.intent_model.predict([message])[0]
        return prediction

    def predict_emotion(self, message: str) -> EmotionType:

        if self.emotion_model is None:
            return detect_emotion(message)
        prediction = self.emotion_model.predict([message])[0]
        return prediction
        
    def analyze_message(self, message: str) -> tuple[IntentType, EmotionType]:
        #dự đoán intent và emotion trong cùng 1 hàm tiện lợi.
        intent = self.predict_intent(message)
        emotion = self.predict_emotion(message)
        return intent, emotion
      

ml_nlu_service = MlNluService()
