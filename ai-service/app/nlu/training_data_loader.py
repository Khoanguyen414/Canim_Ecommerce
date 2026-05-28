from pathlib import Path
import pandas as pd
from app.schemas.chat_schema import EmotionType, IntentType

REQUIRED_COLUMNS = ["text", "intent", "emotion"]
VALID_INTENTS = set(IntentType.__args__)
VALID_EMOTIONS = set(EmotionType.__args__)

class TrainingDatasetLoader:
    def __init__(self, dataset_path: str | Path) -> None:
       self.dataset_path = Path(dataset_path)
    def load(self) -> pd.DataFrame:
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset file not found: {self.dataset_path}")
        dataframe = pd.read_csv(self.dataset_path)
        self._validate_columns(dataframe)
        dataframe = self._clean_dataframe(dataframe)
        self._validate_labels(dataframe)
        return dataframe

    def _validate_columns(self, dataframe: pd.DataFrame) -> None:
        missing_columns = [
            column
            for column in REQUIRED_COLUMNS
            if column not in dataframe.columns
        ]
        if missing_columns:
            raise ValueError(
                f"Dataset missing required columns: {missing_columns}"
            )
    def _clean_dataframe(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        cleaned_dataframe = dataframe.copy()
        for column in REQUIRED_COLUMNS:
            cleaned_dataframe[column] = (
                cleaned_dataframe[column]
                .fillna("")
                .astype(str)
                .str.strip()
            )
        cleaned_dataframe = cleaned_dataframe[
            cleaned_dataframe["text"] != ""
        ]
        return cleaned_dataframe.reset_index(drop=True)
    def _validate_labels(self, dataframe: pd.DataFrame) -> None:
        invalid_intents = sorted(
            set(dataframe["intent"]) - VALID_INTENTS
        )
        invalid_emotions = sorted(
            set(dataframe["emotion"]) - VALID_EMOTIONS
        )
        if invalid_intents:
            raise ValueError(f"Invalid intent labels: {invalid_intents}")
        if invalid_emotions:
            raise ValueError(f"Invalid emotion labels: {invalid_emotions}")
def load_intent_emotion_dataset(
    dataset_path: str | Path = "ai_training/intent_emotion_samples.csv",
) -> pd.DataFrame:
    loader = TrainingDatasetLoader(dataset_path)
    return loader.load()