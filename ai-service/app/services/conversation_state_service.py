from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

from app.utils.text_utils import normalize_text


SESSION_TTL_MINUTES = 60


PRODUCT_KEYWORDS = {
    "áo khoác": ["áo khoác", "jacket", "outerwear"],
    "áo thun": ["áo thun", "t shirt", "t-shirt", "tee"],
    "áo sơ mi": ["áo sơ mi", "sơ mi", "shirt"],
    "quần jean": ["quần jean", "jean", "jeans", "denim"],
    "quần tây": ["quần tây", "quần âu"],
    "váy": ["váy", "đầm", "dress"],
    "blazer": ["blazer", "áo blazer"],
    "giày": ["giày", "sneaker", "sneakers"],
    "túi": ["túi", "túi xách", "bag"],
}


COLOR_KEYWORDS = {
    "đen": ["đen", "black"],
    "trắng": ["trắng", "white"],
    "xanh": ["xanh", "blue"],
    "đỏ": ["đỏ", "red"],
    "hồng": ["hồng", "pink"],
    "be": ["be", "beige", "kem"],
    "nâu": ["nâu", "brown"],
    "xám": ["xám", "ghi", "gray", "grey"],
    "vàng": ["vàng", "yellow"],
}


SIZE_KEYWORDS = {
    "XS": ["xs", "size xs"],
    "S": ["s", "size s"],
    "M": ["m", "size m"],
    "L": ["l", "size l"],
    "XL": ["xl", "size xl"],
    "XXL": ["xxl", "size xxl"],
}


@dataclass
class ConversationState:
    session_id: str
    last_intent: Optional[str] = None
    last_emotion: Optional[str] = None
    product_type: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    last_user_message: Optional[str] = None
    updated_at: datetime = field(default_factory=datetime.utcnow)


class ConversationStateService:
    def __init__(self) -> None:
        self._states: dict[str, ConversationState] = {}

    def get_or_create_state(self, session_id: str) -> ConversationState:
        self.cleanup_expired_states()

        state = self._states.get(session_id)

        if state is None:
            state = ConversationState(session_id=session_id)
            self._states[session_id] = state

        return state

    def update_from_message(
        self,
        session_id: str,
        message: str,
        intent: str,
        emotion: str,
    ) -> ConversationState:
        state = self.get_or_create_state(session_id)
        normalized_message = normalize_text(message)

        state.last_intent = intent
        state.last_emotion = emotion
        state.last_user_message = message
        state.updated_at = datetime.utcnow()

        product_type = self._detect_product_type(normalized_message)
        color = self._detect_color(normalized_message)
        size = self._detect_size(normalized_message)
        budget_min, budget_max = self._detect_budget(normalized_message)

        if product_type:
            state.product_type = product_type

        if color:
            state.color = color

        if size:
            state.size = size

        if budget_min is not None:
            state.budget_min = budget_min

        if budget_max is not None:
            state.budget_max = budget_max

        return state

    def enrich_message_with_context(self, session_id: str, message: str) -> str:
        state = self.get_or_create_state(session_id)
        context_parts: list[str] = []

        if state.product_type:
            context_parts.append(f"sản phẩm: {state.product_type}")

        if state.color:
            context_parts.append(f"màu: {state.color}")

        if state.size:
            context_parts.append(f"size: {state.size}")

        if state.budget_min is not None:
            context_parts.append(f"giá tối thiểu: {state.budget_min}")

        if state.budget_max is not None:
            context_parts.append(f"giá tối đa: {state.budget_max}")

        if not context_parts:
            return message

        context_text = ", ".join(context_parts)

        return f"{message}. Ngữ cảnh trước đó: {context_text}"

    def reset_state(self, session_id: str) -> None:
        self._states.pop(session_id, None)

    def cleanup_expired_states(self) -> None:
        expired_before = datetime.utcnow() - timedelta(minutes=SESSION_TTL_MINUTES)

        expired_session_ids = [
            session_id
            for session_id, state in self._states.items()
            if state.updated_at < expired_before
        ]

        for session_id in expired_session_ids:
            self._states.pop(session_id, None)

    def _detect_product_type(self, normalized_message: str) -> Optional[str]:
        for product_type, keywords in PRODUCT_KEYWORDS.items():
            if self._contains_any(normalized_message, keywords):
                return product_type

        return None

    def _detect_color(self, normalized_message: str) -> Optional[str]:
        for color, keywords in COLOR_KEYWORDS.items():
            if self._contains_any(normalized_message, keywords):
                return color

        return None

    def _detect_size(self, normalized_message: str) -> Optional[str]:
        words = normalized_message.split()

        for size, keywords in SIZE_KEYWORDS.items():
            for keyword in keywords:
                normalized_keyword = normalize_text(keyword)

                if normalized_keyword.startswith("size "):
                    if normalized_keyword in normalized_message:
                        return size

                if len(normalized_keyword) <= 2:
                    if normalized_keyword in words:
                        return size

                if normalized_keyword in normalized_message:
                    return size

        return None

    def _detect_budget(
        self,
        normalized_message: str,
    ) -> tuple[Optional[int], Optional[int]]:
        budget_min: Optional[int] = None
        budget_max: Optional[int] = None

        words = normalized_message.replace(",", " ").split()

        for index, word in enumerate(words):
            amount = self._parse_money_word(word)

            if amount is None:
                continue

            previous_word = words[index - 1] if index > 0 else ""
            next_word = words[index + 1] if index + 1 < len(words) else ""

            if previous_word in {"dưới", "duoi", "không", "khong"}:
                budget_max = amount
                continue

            if previous_word in {"trên", "tren", "hơn", "hon"}:
                budget_min = amount
                continue

            if next_word in {"đổ", "do", "trở", "tro"}:
                budget_max = amount
                continue

            budget_max = amount

        return budget_min, budget_max

    def _parse_money_word(self, word: str) -> Optional[int]:
        clean_word = (
            word.replace(".", "")
            .replace(",", "")
            .replace("đ", "")
            .replace("vnd", "")
            .strip()
        )

        multiplier = 1

        if clean_word.endswith("k"):
            multiplier = 1_000
            clean_word = clean_word[:-1]

        if clean_word.endswith("tr"):
            multiplier = 1_000_000
            clean_word = clean_word[:-2]

        if not clean_word.isdigit():
            return None

        return int(clean_word) * multiplier

    def _contains_any(self, text: str, keywords: list[str]) -> bool:
        return any(normalize_text(keyword) in text for keyword in keywords)


conversation_state_service = ConversationStateService()