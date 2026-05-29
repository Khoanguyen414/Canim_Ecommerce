from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.nlu.training_data_loader import load_intent_emotion_dataset


DATASET_PATH = Path("ai_training/intent_emotion_samples.csv")
MODEL_OUTPUT_DIR = Path("models")
RANDOM_STATE = 42
TEST_SIZE = 0.2
def build_text_classifier() -> Pipeline:
    return Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    ngram_range=(1, 2),
                    max_features=5000,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def train_single_model(
    dataframe: pd.DataFrame,
    label_column: str,
    output_path: Path,
) -> Pipeline:
    x_text = dataframe["text"]
    y_label = dataframe[label_column]
    stratify_target = y_label if y_label.value_counts().min() >= 2 else None
    x_train, x_test, y_train, y_test = train_test_split(
        x_text,
        y_label,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=stratify_target,
    )
    model = build_text_classifier()
    # Tạo pipeline model mới.

    model.fit(x_train, y_train)
    y_pred = model.predict(x_test)
    # Cho model dự đoán trên tập test.

    print("=" * 80)
    print(f"Training report for: {label_column}")
    print("=" * 80)
    print(classification_report(y_test, y_pred, zero_division=0))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Saved model to: {output_path}")

    return model


def train_intent_and_emotion_models() -> None:
    dataframe = load_intent_emotion_dataset(DATASET_PATH)
    print("=" * 80)
    print("Dataset loaded successfully")
    print("=" * 80)
    print(f"Rows: {len(dataframe)}")
    print("\nIntent distribution:")
    print(dataframe["intent"].value_counts())
    print("\nEmotion distribution:")
    print(dataframe["emotion"].value_counts())

    train_single_model(
        dataframe=dataframe,
        label_column="intent",
        output_path=MODEL_OUTPUT_DIR / "intent_classifier.joblib",
    )

    train_single_model(
        dataframe=dataframe,
        label_column="emotion",
        output_path=MODEL_OUTPUT_DIR / "emotion_classifier.joblib",
    )

    print("=" * 80)
    print("Training completed successfully")
    print("=" * 80)


if __name__ == "__main__":
    train_intent_and_emotion_models()