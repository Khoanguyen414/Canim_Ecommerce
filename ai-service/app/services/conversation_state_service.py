from typing import Any, Optional


class ConversationState:
    """
    Bộ nhớ ngắn hạn theo từng phiên chat.

    Ví dụ:
    - Lượt 1 khách nói: "Mình cao 170cm"
    - Lượt 2 khách nói: "nặng 60kg mặc size gì?"
    Bot vẫn nhớ heightCm = 170 để tư vấn Size M.
    """

    def __init__(self) -> None:
        self.collected_entities: dict[str, Any] = {}

        self.bot_status: str = "ACTIVE"
        # ACTIVE = bot hoạt động bình thường
        # NEEDS_HUMAN_ATTENTION = khách đang bực, ưu tiên người thật

        self.last_intent: Optional[str] = None
        self.last_emotion: Optional[str] = None
        self.last_widget_type: Optional[str] = None
        self.last_user_message: Optional[str] = None


class ConversationStateService:
    def __init__(self) -> None:
        self._states: dict[str, ConversationState] = {}

    def get_or_create(self, session_id: str) -> ConversationState:
        safe_session_id = self._normalize_session_id(session_id)

        if safe_session_id not in self._states:
            self._states[safe_session_id] = ConversationState()

        return self._states[safe_session_id]

    def clear_state(self, session_id: str) -> None:
        safe_session_id = self._normalize_session_id(session_id)
        self._states[safe_session_id] = ConversationState()

    def _normalize_session_id(self, session_id: str) -> str:
        if not session_id:
            return "default"

        normalized = session_id.strip()

        return normalized or "default"


conversation_state_service = ConversationStateService()