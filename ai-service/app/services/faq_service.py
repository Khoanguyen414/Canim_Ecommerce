from pathlib import Path
from typing import Optional

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.utils.text_utils import normalize_text


FAQ_DATASET_PATH = Path("ai_training/chatbot_faq_dataset.csv")

MIN_SIMILARITY_SCORE = 0.32

class FaqMatchResult:

    def __init__(
        self,
        intent: str,
        user_query: str,
        bot_response: str,
        similarity_score: float,
    ) -> None:
        self.intent = intent
        self.user_query = user_query
        self.bot_response = bot_response
        self.similarity_score = similarity_score


class FaqService:

    def __init__(self, dataset_path: Path = FAQ_DATASET_PATH) -> None:
        self.dataset_path = dataset_path
        self.dataframe = self._load_dataset()
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            max_features=4000,
        )

        self.faq_matrix = self._build_faq_matrix()

    def _load_dataset(self) -> pd.DataFrame:
        

        if not self.dataset_path.exists():
            return pd.DataFrame(columns=["intent", "user_query", "bot_response"])

        dataframe = pd.read_csv(self.dataset_path)

        required_columns = {"intent", "user_query", "bot_response"}
        missing_columns = required_columns - set(dataframe.columns)

        if missing_columns:
            raise ValueError(f"FAQ dataset missing columns: {sorted(missing_columns)}")

        cleaned_dataframe = dataframe.copy()

        for column in required_columns:
            cleaned_dataframe[column] = (
                cleaned_dataframe[column]
                .fillna("")
                .astype(str)
                .str.strip()
            )

        cleaned_dataframe = cleaned_dataframe[
            (cleaned_dataframe["intent"] != "")
            & (cleaned_dataframe["user_query"] != "")
            & (cleaned_dataframe["bot_response"] != "")
        ]

        cleaned_dataframe["normalized_query"] = cleaned_dataframe["user_query"].apply(
            normalize_text
        )

        return cleaned_dataframe.reset_index(drop=True)

    def _build_faq_matrix(self):

        if self.dataframe.empty:
            return None

        return self.vectorizer.fit_transform(self.dataframe["normalized_query"])

    def find_best_answer(
        self,
        message: str,
        intent: Optional[str] = None,
    ) -> Optional[FaqMatchResult]:
       
        if self.dataframe.empty or self.faq_matrix is None:
            return None

        normalized_message = normalize_text(message)

        if not normalized_message:
            return None

        candidate_dataframe = self.dataframe

        if intent:
            intent_candidates = self.dataframe[self.dataframe["intent"] == intent]
            if not intent_candidates.empty:
                candidate_dataframe = intent_candidates
        # Nếu intent có dữ liệu FAQ tương ứng,
        # chỉ tìm trong nhóm đó để tăng độ chính xác.

        candidate_queries = candidate_dataframe["normalized_query"].tolist()

        candidate_matrix = self.vectorizer.transform(candidate_queries)
        message_vector = self.vectorizer.transform([normalized_message])

        scores = cosine_similarity(message_vector, candidate_matrix)[0]
        # cosine_similarity đo độ giống giữa câu khách và từng câu FAQ.
        #
        # Score càng cao nghĩa là càng giống.

        best_position = int(scores.argmax())
        best_score = float(scores[best_position])

        if best_score < MIN_SIMILARITY_SCORE:
            return None
        # Nếu câu khách không đủ giống FAQ nào,
        # không trả lời bằng FAQ để tránh trả sai.

        best_row = candidate_dataframe.iloc[best_position]

        return FaqMatchResult(
            intent=str(best_row["intent"]),
            user_query=str(best_row["user_query"]),
            bot_response=str(best_row["bot_response"]),
            similarity_score=best_score,
        )


faq_service = FaqService()