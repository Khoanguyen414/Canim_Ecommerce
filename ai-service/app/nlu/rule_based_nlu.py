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

    Nhiệm vụ:
    - Nhận diện câu chào.
    - Nhận diện hỏi size.
    - Nhận diện phàn nàn.
    - Nhận diện theo dõi đơn hàng.
    - Nhận diện tìm sản phẩm / gợi ý outfit.
    """

    COMPLAINT_KEYWORDS = [
        "tao lao",
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

    SIZE_KEYWORDS = [
        "size",
        "kich co",
        "mac vua",
        "mac rong",
        "oversize",
        "cao",
        "nang",
        "kg",
        "ky",
        "ki",
        "can",
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

    PRODUCT_ACTION_KEYWORDS = [
        "goi y",
        "tim",
        "mua",
        "chon",
        "loc",
        "co",
        "ban",
        "recommend",
        "suggest",
    ]

    PRODUCT_KEYWORDS = [
        # Nhóm chung
        "san pham",
        "hang",
        "item",
        "do",
        "mau",

        # Áo
        "ao",
        "ao thun",
        "ao phong",
        "ao so mi",
        "so mi",
        "ao khoac",
        "hoodie",
        "sweater",
        "blazer",
        "vest",

        # Quần
        "quan",
        "quan jean",
        "jean",
        "denim",
        "quan tay",
        "quan au",
        "quan short",
        "quan ong suong",

        # Váy / đầm
        "vay",
        "dam",
        "chan vay",

        # Giày dép
        "giay",
        "giay da",
        "giay da nam",
        "giay the thao",
        "sneaker",
        "dep",
        "sandal",

        # Phụ kiện
        "phu kien",
        "tui",
        "balo",
        "mu",
        "non",
        "that lung",
        "vi",

        # Thuộc tính sản phẩm
        "basic",
        "local",
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
        "size",
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

        if self._is_size_message(text, entities):
            return NLUResult("SIZE_SUGGESTION", "NEUTRAL", entities)

        if self._is_outfit_message(text):
            return NLUResult("OUTFIT_SUGGESTION", "NEUTRAL", entities)

        if self._is_product_message(text):
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
            r"nang\s*([3-9][0-9])",
            r"([3-9][0-9])\s*kg",
            r"([3-9][0-9])\s*ky",
            r"([3-9][0-9])\s*ki",
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
        if self._contains_any(text, ["oversize", "rong", "thoai mai", "rộng"]):
            return "OVERSIZE"

        if self._contains_any(text, ["om", "vua", "fit"]):
            return "REGULAR"

        return None

    def _is_size_message(self, text: str, entities: dict[str, Any]) -> bool:
        if entities.get("heightCm") or entities.get("weightKg"):
            return True

        return self._contains_any(text, self.SIZE_KEYWORDS)

    def _is_outfit_message(self, text: str) -> bool:
        if self._contains_any(text, self.OUTFIT_KEYWORDS):
            return True

        has_action = self._contains_any(text, self.PRODUCT_ACTION_KEYWORDS)
        has_outfit_context = self._contains_any(text, self.OUTFIT_CONTEXT_KEYWORDS)
        has_multiple_item_hint = self._contains_any(
            text,
            ["phoi", "mix", "set", "combo", "di lam", "di choi", "di tiec"],
        )

        return has_action and has_outfit_context and has_multiple_item_hint

    def _is_product_message(self, text: str) -> bool:
        has_product_keyword = self._contains_any(text, self.PRODUCT_KEYWORDS)
        has_action_keyword = self._contains_any(text, self.PRODUCT_ACTION_KEYWORDS)

        # Ví dụ:
        # "gợi ý giày da nam"
        # "tìm áo thun basic"
        # "mua quần jean"
        if has_action_keyword and has_product_keyword:
            return True

        # Ví dụ:
        # "áo thun basic"
        # "giày da nam"
        # "quần jean đen"
        if has_product_keyword:
            return True

        return False

    def _contains_any(self, text: str, keywords: list[str]) -> bool:
        return any(keyword in text for keyword in keywords)

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

        separators = [",", ".", ";", ":", "/", "\\", "-", "_", "(", ")", "[", "]"]

        for separator in separators:
            text = text.replace(separator, " ")

        return " ".join(text.split())


rule_based_nlu = RuleBasedNLU()