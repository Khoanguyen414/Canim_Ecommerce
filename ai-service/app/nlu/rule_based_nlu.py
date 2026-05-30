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

    Thứ tự nhận diện intent:
    SECURITY_BLOCK → COMPLAINT → ORDER_TRACKING → OUTFIT/PRODUCT → SIZE
    → PROMOTION/SHIPPING/RETURN → THANKS → GREETING → UNKNOWN
    """

    COMPLAINT_KEYWORDS = [
        "tao lao",
        "tào lao",
        "tra loi tao lao",
        "tra loi tao lao qua",
        "vo tri",
        "chan",
        "sai roi",
        "khong dung",
        "rep gi",
        "tra loi gi",
        "kho chiu",
        "buc",
    ]

    GREETING_KEYWORDS = [
        "xin chao",
        "chao shop",
        "chao ban",
        "chao",
        "hello",
        "hi",
        "alo",
    ]

    THANKS_KEYWORDS = [
        "cam on",
        "thanks",
        "thank you",
        "ok cam on",
        "oke cam on",
    ]

    ORDER_KEYWORDS = [
        "don hang",
        "ma don",
        "trang thai don",
        "theo doi don",
        "kiem tra don",
        "order",
    ]

    SIZE_PHRASE_KEYWORDS = [
        "size nao",
        "size gi",
        "mac size nao",
        "mac size gi",
        "kich co nao",
        "kich co gi",
        "tu van size",
        "goi y size",
        "mac vua khong",
        "mac vua duoc khong",
    ]

    SIZE_WORD_KEYWORDS = [
        "size",
        "kichco",
        "oversize",
    ]

    PROMOTION_KEYWORDS = [
        "khuyen mai",
        "giam gia",
        "voucher",
        "ma giam",
        "sale",
        "freeship",
    ]

    SHIPPING_KEYWORDS = [
        "giao hang",
        "ship",
        "shipping",
        "bao lau",
        "phi ship",
        "van chuyen",
    ]

    RETURN_KEYWORDS = [
        "doi tra",
        "tra hang",
        "hoan tien",
        "doi size",
        "bao hanh",
    ]

    SECURITY_KEYWORDS = [
        "hack",
        "sql injection",
        "danh cap",
        "password",
        "mat khau",
    ]

    OUTFIT_KEYWORDS = [
        "outfit",
        "phoi do",
        "mix do",
        "set do",
        "combo",
        "look",
        "style",
        "phong cach",
    ]

    OUTFIT_CONTEXT_KEYWORDS = [
        "di lam",
        "di choi",
        "di tiec",
        "di hoc",
        "di hen ho",
        "cong so",
        "thanh lich",
        "nang dong",
        "nu tinh",
        "ca tinh",
        "tone",
        "mau",
    ]

    PRODUCT_ACTION_PHRASES = [
        "goi y",
        "co ban",
        "dang ban",
        "shop co",
    ]

    PRODUCT_ACTION_WORDS = [
        "tim",
        "mua",
        "chon",
        "loc",
        "recommend",
        "suggest",
    ]

    PRODUCT_PHRASE_KEYWORDS = [
        "san pham",
        "ao thun",
        "ao phong",
        "ao so mi",
        "ao khoac",
        "ao polo",
        "quan jean",
        "quan tay",
        "quan au",
        "quan short",
        "quan ong suong",
        "chan vay",
        "giay da",
        "giay da nam",
        "giay the thao",
        "phu kien",
        "that lung",
        "day chuyen",
        "mat day",
        "vong tay",
        "bong tai",
        "trang suc",
    ]

    PRODUCT_WORD_KEYWORDS = [
        "hang",
        "item",
        "ao",
        "polo",
        "so",
        "mi",
        "hoodie",
        "sweater",
        "blazer",
        "vest",
        "quan",
        "jean",
        "denim",
        "vay",
        "dam",
        "giay",
        "sneaker",
        "dep",
        "sandal",
        "tui",
        "balo",
        "mu",
        "non",
        "vi",
        "basic",
        "local",
        "chuyen",
        "day",
        "lac",
        "nhan",
        "vong",
        "khan",
        "kinh",
        "nam",
        "nu",
        "unisex",
        "den",
        "trang",
        "nau",
        "be",
        "kem",
        "xanh",
        "do",
        "hong",
    ]

    def analyze_message(self, message: str) -> NLUResult:
        text = self._normalize_text(message)
        entities = self._extract_entities(text)

        if self._contains_any(text, self.SECURITY_KEYWORDS):
            return NLUResult("SECURITY_BLOCK", "NEUTRAL", entities)

        if self._contains_any(text, self.COMPLAINT_KEYWORDS):
            return NLUResult("COMPLAINT", "ANGRY", entities)

        if self._contains_any(text, self.ORDER_KEYWORDS) or entities.get("orderCode"):
            return NLUResult("ORDER_TRACKING", "NEUTRAL", entities)

        if self._is_outfit_message(text):
            return NLUResult("OUTFIT_SUGGESTION", "NEUTRAL", entities)

        if self._is_product_message(text):
            return NLUResult("PRODUCT_RECOMMENDATION", "NEUTRAL", entities)

        if self._is_size_message(text, entities):
            return NLUResult("SIZE_SUGGESTION", "NEUTRAL", entities)

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
        standalone = re.fullmatch(
            r"(?:cao\s*)?(1[4-9][0-9]|2[0-1][0-9])\s*(?:cm)?",
            text.strip(),
        )

        if standalone:
            return int(standalone.group(1))

        patterns = [
            (r"(?:cao\s*)?([1-2])m\s*([0-9]{1,2})\b", "meters"),
            (r"\bm([0-9]{2})\b", "compact_m"),
            (r"\bm\s*([0-9]{2})\b", "compact_m"),
            (r"\bm([0-9])(?![0-9])\b", "compact_m_single"),
            (r"\b(1[4-9][0-9]|2[0-1][0-9])\s+[3-9][0-9](?:\s*kg|\b)", "bare_with_weight"),
            (r"(?:cao\s*)?(1[4-9][0-9]|2[0-1][0-9])\s*cm", "cm"),
            (r"\bcao\s*(1[4-9][0-9]|2[0-1][0-9])\b", "cao"),
        ]

        for pattern, mode in patterns:
            match = re.search(pattern, text)

            if not match:
                continue

            if mode in {"compact_m"}:
                return 100 + int(match.group(1))

            if mode == "compact_m_single":
                return 100 + int(match.group(1)) * 10

            if mode == "meters":
                meters = int(match.group(1))
                centimeters = int(match.group(2))

                if centimeters < 10:
                    centimeters *= 10

                return meters * 100 + centimeters

            return int(match.group(1))

        return None

    def _extract_weight_kg(self, text: str) -> int | None:
        patterns = [
            r"\bnang\s*([3-9][0-9])\b",
            r"\b(?:1[4-9][0-9]|2[0-1][0-9])\s+([3-9][0-9])(?:\s*kg|\b)",
            r"\b([3-9][0-9])\s*kg\b",
            r"\b([3-9][0-9])\s*ky\b",
            r"\b([3-9][0-9])\s*ki\b",
            r"\b([3-9][0-9])\s*can\b",
            r",\s*([3-9][0-9])(?:\s*kg|\s|$)",
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
        if self._contains_any(text, ["oversize", "mac rong", "rong", "thoai mai"]):
            return "OVERSIZE"

        if self._contains_any(text, ["mac vua", "om", "vua", "fit"]):
            return "REGULAR"

        return None

    def _is_size_message(self, text: str, entities: dict[str, Any]) -> bool:
        if entities.get("heightCm") is not None or entities.get("weightKg") is not None:
            return True

        if self._contains_any(text, self.SIZE_PHRASE_KEYWORDS):
            return True

        if self._contains_word(text, "size") or self._contains_word(text, "kichco"):
            return True

        if self._contains_word(text, "cao") and (
            entities.get("weightKg") is not None
            or self._contains_word(text, "nang")
            or re.search(r"\bkg\b", text)
        ):
            return True

        if self._contains_word(text, "nang") and re.search(r"\bkg\b", text):
            return True

        if re.search(r"\bkg\b", text) and re.search(r"\b[3-9][0-9]\b", text):
            return True

        return False

    def is_fit_preference_only(self, text: str, entities: dict[str, Any]) -> bool:
        if not entities.get("fitPreference"):
            return False

        return not self._is_size_message(text, entities)

    def is_measurement_followup(self, text: str) -> bool:
        normalized = self._normalize_text(text)

        if self._extract_height_cm(normalized) is not None:
            return True

        if self._extract_weight_kg(normalized) is not None:
            return True

        return bool(
            re.search(r"\bm[0-9]", normalized)
            or re.search(r"\b(1[4-9][0-9]|2[0-1][0-9])\b", normalized)
            or re.search(r"\b[3-9][0-9]\s*kg\b", normalized)
            or re.search(r"\bnang\b", normalized)
            or re.search(r"\bcao\b", normalized)
        )

    def _is_outfit_message(self, text: str) -> bool:
        if self._contains_any(text, self.OUTFIT_KEYWORDS):
            return True

        has_action = self._has_product_action(text)
        has_outfit_context = self._contains_any(text, self.OUTFIT_CONTEXT_KEYWORDS)
        has_multiple_item_hint = self._contains_any(
            text,
            ["phoi", "mix", "set", "combo", "di lam", "di choi", "di tiec"],
        )

        return has_action and has_outfit_context and has_multiple_item_hint

    def _is_product_message(self, text: str) -> bool:
        has_product_keyword = self._has_product_keyword(text)
        has_action_keyword = self._has_product_action(text)

        if has_action_keyword and has_product_keyword:
            return True

        if has_product_keyword and not self._contains_any(text, self.GREETING_KEYWORDS):
            return True

        return False

    def _has_product_action(self, text: str) -> bool:
        if self._contains_any(text, self.PRODUCT_ACTION_PHRASES):
            return True

        return any(self._contains_word(text, keyword) for keyword in self.PRODUCT_ACTION_WORDS)

    def _has_product_keyword(self, text: str) -> bool:
        if self._contains_any(text, self.PRODUCT_PHRASE_KEYWORDS):
            return True

        return any(self._contains_word(text, keyword) for keyword in self.PRODUCT_WORD_KEYWORDS)

    def _contains_any(self, text: str, keywords: list[str]) -> bool:
        return any(self._contains_keyword(text, keyword) for keyword in keywords)

    def _contains_keyword(self, text: str, keyword: str) -> bool:
        normalized_keyword = self._normalize_text(keyword)

        if not normalized_keyword:
            return False

        if " " in normalized_keyword:
            return normalized_keyword in text

        return self._contains_word(text, normalized_keyword)

    def _contains_word(self, text: str, word: str) -> bool:
        return re.search(rf"\b{re.escape(word)}\b", text) is not None

    def _normalize_text(self, value: str) -> str:
        text = str(value or "").lower().strip()

        replacements = {
            "á": "a",
            "à": "a",
            "ả": "a",
            "ã": "a",
            "ạ": "a",
            "ă": "a",
            "ắ": "a",
            "ằ": "a",
            "ẳ": "a",
            "ẵ": "a",
            "ặ": "a",
            "â": "a",
            "ấ": "a",
            "ầ": "a",
            "ẩ": "a",
            "ẫ": "a",
            "ậ": "a",
            "đ": "d",
            "é": "e",
            "è": "e",
            "ẻ": "e",
            "ẽ": "e",
            "ẹ": "e",
            "ê": "e",
            "ế": "e",
            "ề": "e",
            "ể": "e",
            "ễ": "e",
            "ệ": "e",
            "í": "i",
            "ì": "i",
            "ỉ": "i",
            "ĩ": "i",
            "ị": "i",
            "ó": "o",
            "ò": "o",
            "ỏ": "o",
            "õ": "o",
            "ọ": "o",
            "ô": "o",
            "ố": "o",
            "ồ": "o",
            "ổ": "o",
            "ỗ": "o",
            "ộ": "o",
            "ơ": "o",
            "ớ": "o",
            "ờ": "o",
            "ở": "o",
            "ỡ": "o",
            "ợ": "o",
            "ú": "u",
            "ù": "u",
            "ủ": "u",
            "ũ": "u",
            "ụ": "u",
            "ư": "u",
            "ứ": "u",
            "ừ": "u",
            "ử": "u",
            "ữ": "u",
            "ự": "u",
            "ý": "y",
            "ỳ": "y",
            "ỷ": "y",
            "ỹ": "y",
            "ỵ": "y",
        }

        for source, target in replacements.items():
            text = text.replace(source, target)

        text = text.replace("kích cỡ", "kich co")
        text = text.replace("kich co", "kichco")

        separators = [",", ".", ";", ":", "/", "\\", "-", "_", "(", ")", "[", "]"]

        for separator in separators:
            text = text.replace(separator, " ")

        return " ".join(text.split())


rule_based_nlu = RuleBasedNLU()
