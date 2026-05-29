import re
from typing import Any

from app.schemas.chat_schema import EmotionType, IntentType


class NLUResult:
    def __init__(
        self,
        intent: IntentType,
        emotion: EmotionType,
        entities: dict[str, Any],
    ) -> None:
        self.intent = intent
        self.emotion = emotion
        self.entities = entities


class RuleBasedNLU:
    """
    RuleBasedNLU là tầng guardrail an toàn.

    Nó xử lý chắc chắn các case quan trọng:
    - Chào hỏi không được hiện sản phẩm.
    - Hỏi size phải bắt được số đo.
    - Khách phàn nàn thì không bán hàng tiếp.
    - Hỏi đơn hàng thì không hiện carousel sản phẩm.
    """

    COMPLAINT_KEYWORDS = [
        "tào lào",
        "tao lao",
        "vô tri",
        "vo tri",
        "chán",
        "chan",
        "sai rồi",
        "sai roi",
        "không đúng",
        "khong dung",
        "rep gì",
        "rep gi",
        "trả lời gì",
        "tra loi gi",
        "khó chịu",
        "kho chiu",
        "bực",
        "buc",
    ]

    GREETING_KEYWORDS = [
        "xin chào",
        "xin chao",
        "chào shop",
        "chao shop",
        "chào bạn",
        "chao ban",
        "chào",
        "chao",
        "hello",
        "hi",
        "alo",
    ]

    THANKS_KEYWORDS = [
        "cảm ơn",
        "cam on",
        "thanks",
        "thank you",
        "ok cảm ơn",
        "oke cảm ơn",
    ]

    OUTFIT_KEYWORDS = [
        "outfit",
        "phối đồ",
        "phoi do",
        "mix đồ",
        "mix do",
        "đi làm",
        "di lam",
        "đi chơi",
        "di choi",
        "đi tiệc",
        "di tiec",
        "tone",
        "style",
        "phong cách",
        "phong cach",
    ]

    PRODUCT_KEYWORDS = [
        "áo",
        "ao",
        "quần",
        "quan",
        "váy",
        "vay",
        "đầm",
        "dam",
        "blazer",
        "sơ mi",
        "so mi",
        "áo khoác",
        "ao khoac",
        "jean",
        "denim",
        "sản phẩm",
        "san pham",
        "tìm",
        "tim",
        "mua",
    ]

    SIZE_KEYWORDS = [
        "size",
        "kích cỡ",
        "kich co",
        "mặc vừa",
        "mac vua",
        "mặc rộng",
        "mac rong",
        "oversize",
        "cao",
        "nặng",
        "nang",
        "kg",
        "ký",
        "ki",
        "cân",
        "can",
    ]

    ORDER_KEYWORDS = [
        "đơn hàng",
        "don hang",
        "mã đơn",
        "ma don",
        "trạng thái đơn",
        "trang thai don",
        "theo dõi đơn",
        "theo doi don",
        "kiểm tra đơn",
        "kiem tra don",
        "order",
    ]

    PROMOTION_KEYWORDS = [
        "khuyến mãi",
        "khuyen mai",
        "giảm giá",
        "giam gia",
        "voucher",
        "mã giảm",
        "ma giam",
        "sale",
    ]

    SHIPPING_KEYWORDS = [
        "giao hàng",
        "giao hang",
        "ship",
        "shipping",
        "bao lâu",
        "bao lau",
        "phí ship",
        "phi ship",
    ]

    RETURN_KEYWORDS = [
        "đổi trả",
        "doi tra",
        "trả hàng",
        "tra hang",
        "hoàn tiền",
        "hoan tien",
        "đổi size",
        "doi size",
    ]

    SECURITY_KEYWORDS = [
        "hack",
        "sql injection",
        "đánh cắp",
        "danh cap",
        "password",
        "mật khẩu",
        "mat khau",
    ]

    def analyze_message(self, message: str) -> NLUResult:
        text = message.strip().lower()
        entities = self._extract_entities(text)

        if self._contains_any(text, self.SECURITY_KEYWORDS):
            return NLUResult("SECURITY_BLOCK", "NEUTRAL", entities)

        if self._contains_any(text, self.COMPLAINT_KEYWORDS):
            return NLUResult("COMPLAINT", "ANGRY", entities)

        if self._contains_any(text, self.ORDER_KEYWORDS) or entities.get("orderCode"):
            return NLUResult("ORDER_TRACKING", "NEUTRAL", entities)

        if self._is_size_message(text, entities):
            return NLUResult("SIZE_SUGGESTION", "NEUTRAL", entities)

        if self._contains_any(text, self.OUTFIT_KEYWORDS):
            return NLUResult("OUTFIT_SUGGESTION", "NEUTRAL", entities)

        if self._contains_any(text, self.PRODUCT_KEYWORDS):
            return NLUResult("PRODUCT_RECOMMENDATION", "NEUTRAL", entities)

        if self._contains_any(text, self.PROMOTION_KEYWORDS):
            return NLUResult("PROMOTION", "NEUTRAL", entities)

        if self._contains_any(text, self.SHIPPING_KEYWORDS):
            return NLUResult("SHIPPING_POLICY", "NEUTRAL", entities)

        if self._contains_any(text, self.RETURN_KEYWORDS):
            return NLUResult("RETURN_POLICY", "NEUTRAL", entities)

        if self._contains_any(text, self.THANKS_KEYWORDS):
            return NLUResult("THANKS", "HAPPY", entities)

        if self._contains_any(text, self.GREETING_KEYWORDS):
            return NLUResult("GREETING", "NEUTRAL", entities)

        return NLUResult("UNKNOWN", "NEUTRAL", entities)

    def _extract_entities(self, text: str) -> dict[str, Any]:
        entities: dict[str, Any] = {}

        height_cm = self._extract_height_cm(text)
        weight_kg = self._extract_weight_kg(text)
        order_code = self._extract_order_code(text)
        fit_preference = self._extract_fit_preference(text)

        if height_cm is not None:
            entities["heightCm"] = height_cm

        if weight_kg is not None:
            entities["weightKg"] = weight_kg

        if order_code:
            entities["orderCode"] = order_code

        if fit_preference:
            entities["fitPreference"] = fit_preference

        return entities

    def _extract_height_cm(self, text: str) -> int | None:
        patterns = [
            r"(?:cao\s*)?([1-2])m\s*([0-9]{1,2})",
            r"\bm\s*([0-9]{2})\b",
            r"(?:cao\s*)?(1[4-9][0-9]|2[0-1][0-9])\s*cm",
            r"cao\s*(1[4-9][0-9]|2[0-1][0-9])",
        ]

        for pattern in patterns:
            match = re.search(pattern, text)

            if not match:
                continue

            if pattern == r"\bm\s*([0-9]{2})\b":
                return 100 + int(match.group(1))

            if len(match.groups()) == 2:
                meters = int(match.group(1))
                centimeters = int(match.group(2))

                if centimeters < 10:
                    centimeters *= 10

                return meters * 100 + centimeters

            return int(match.group(1))

        return None

    def _extract_weight_kg(self, text: str) -> int | None:
        patterns = [
            r"nặng\s*([3-9][0-9])",
            r"nang\s*([3-9][0-9])",
            r"([3-9][0-9])\s*kg",
            r"([3-9][0-9])\s*ký",
            r"([3-9][0-9])\s*ki",
            r"([3-9][0-9])\s*cân",
            r"([3-9][0-9])\s*can",
        ]

        for pattern in patterns:
            match = re.search(pattern, text)

            if match:
                return int(match.group(1))

        return None

    def _extract_order_code(self, text: str) -> str | None:
        match = re.search(r"\b(ord|dh|order)-[a-z0-9-]+\b", text, re.IGNORECASE)

        if not match:
            return None

        return match.group(0).upper()

    def _extract_fit_preference(self, text: str) -> str | None:
        if self._contains_any(text, ["oversize", "rộng", "rong", "thoải mái", "thoai mai"]):
            return "OVERSIZE"

        if self._contains_any(text, ["ôm", "om", "vừa", "vua", "fit"]):
            return "REGULAR"

        return None

    def _is_size_message(self, text: str, entities: dict[str, Any]) -> bool:
        if entities.get("heightCm") or entities.get("weightKg"):
            return True

        return self._contains_any(text, self.SIZE_KEYWORDS)

    def _contains_any(self, text: str, keywords: list[str]) -> bool:
        return any(keyword in text for keyword in keywords)


rule_based_nlu = RuleBasedNLU()