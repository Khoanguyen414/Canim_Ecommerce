from app.schemas.chat_schema import EmotionType, IntentType
from app.utils.text_utils import contains_any, normalize_text


SECURITY_KEYWORDS = [
    "ignore previous",
    "bỏ qua chỉ thị",
    "bo qua chi thi",
    "xuất database",
    "xuat database",
    "show database",
    "mật khẩu",
    "mat khau",
    "password",
    "token hệ thống",
    "token he thong",
    "system prompt",
    "api key",
]
GREETING_KEYWORDS = [
    "chào",
    "xin chào",
    "hello",
    "hi",
    "shop ơi",
    "alo",
]

THANKS_KEYWORDS = [
    "cảm ơn",
    "cam on",
    "thank",
    "thanks",
    "iu shop",
]

PRODUCT_KEYWORDS = [
    "tìm",
    "tim",
    "mua",
    "áo",
    "ao",
    "quần",
    "quan",
    "váy",
    "vay",
    "đầm",
    "dam",
    "giày",
    "giay",
    "túi",
    "tui",
    "sản phẩm",
    "san pham",
    "cotton",
    "denim",
    "linen",
]

OUTFIT_KEYWORDS = [
    "phối đồ",
    "phoi do",
    "outfit",
    "set đồ",
    "set do",
    "đi làm",
    "di lam",
    "đi chơi",
    "di choi",
    "dự tiệc",
    "du tiec",
]

SIZE_KEYWORDS = [
    "size",
    "cao",
    "nặng",
    "nang",
    "kg",
    "cm",
    "mặc vừa",
    "mac vua",
    "bảng size",
    "bang size",
    "tư vấn size",
    "tu van size",
]
ORDER_KEYWORDS = [
    "đơn hàng",
    "don hang",
    "mã đơn",
    "ma don",
    "kiểm tra đơn",
    "kiem tra don",
    "theo dõi đơn",
    "theo doi don",
    "ord-",
]

PROMOTION_KEYWORDS = [
    "khuyến mãi",
    "khuyen mai",
    "sale",
    "giảm giá",
    "giam gia",
    "voucher",
    "ưu đãi",
    "uu dai",
]

SHIPPING_KEYWORDS = [
    "ship",
    "giao hàng",
    "giao hang",
    "vận chuyển",
    "van chuyen",
    "bao lâu",
    "bao lau",
    "phí ship",
    "phi ship",
]

RETURN_KEYWORDS = [
    "đổi",
    "doi",
    "trả",
    "tra",
    "hoàn",
    "hoan",
    "đổi size",
    "doi size",
    "chật",
    "chat",
    "không vừa",
    "khong vua",
]

COMPLAINT_KEYWORDS = [
    "chán",
    "chan",
    "tệ",
    "te",
    "sai",
    "lỗi",
    "loi",
    "không đúng",
    "khong dung",
    "giao sai",
    "không hài lòng",
    "khong hai long",
]

ANGRY_KEYWORDS = [
    "tức",
    "tuc",
    "bực",
    "buc",
    "ức chế",
    "uc che",
    "quá chán",
    "qua chan",
    "lừa",
    "lua",
    "bực mình",
    "buc minh",
]

CONFUSED_KEYWORDS = [
    "không hiểu",
    "khong hieu",
    "là sao",
    "la sao",
    "gì vậy",
    "gi vay",
    "khó hiểu",
    "kho hieu",
]

HAPPY_KEYWORDS = [
    "yêu bạn",
    "yeu ban",
    "cute",
    "dễ thương",
    "de thuong",
    "haha",
    "hihi",
    "hehe",
]


def detect_intent(message: str) -> IntentType:
    text = normalize_text(message)
    if contains_any(text, SECURITY_KEYWORDS):
        return "SECURITY_BLOCK"
    if contains_any(text, GREETING_KEYWORDS):
        return "GREETING"
    if contains_any(text, THANKS_KEYWORDS):
        return "THANKS"
    if contains_any(text, ORDER_KEYWORDS):
        return "ORDER_TRACKING"
    if contains_any(text, PROMOTION_KEYWORDS):
        return "PROMOTION"
    if contains_any(text, SHIPPING_KEYWORDS):
        return "SHIPPING_POLICY"
    if contains_any(text, RETURN_KEYWORDS):
        return "RETURN_POLICY"
    if contains_any(text, SIZE_KEYWORDS):
        return "SIZE_SUGGESTION"
    if contains_any(text, OUTFIT_KEYWORDS):
        return "OUTFIT_SUGGESTION"
    if contains_any(text, PRODUCT_KEYWORDS):
        return "PRODUCT_RECOMMENDATION"
    if contains_any(text, COMPLAINT_KEYWORDS) or contains_any(text, ANGRY_KEYWORDS):
        return "COMPLAINT"
    if contains_any(text, HAPPY_KEYWORDS):
        return "SMALL_TALK"
    return "UNKNOWN"
def detect_emotion(message: str) -> EmotionType:
    text = normalize_text(message)

    if contains_any(text, ANGRY_KEYWORDS):
        return "ANGRY"
    if contains_any(text, COMPLAINT_KEYWORDS):
        return "COMPLAINT"
    if contains_any(text, THANKS_KEYWORDS):
        return "THANKS"
    if contains_any(text, HAPPY_KEYWORDS):
        return "HAPPY"
    if contains_any(text, CONFUSED_KEYWORDS):
        #bối rối, không hiểu gì cả, kiểu như "cái gì vậy", "là sao", "gì thế này"...
        return "CONFUSED"
    if contains_any(text, GREETING_KEYWORDS):
        return "FRIENDLY"
    return "NEUTRAL"
    # Nếu không có cảm xúc rõ ràng thì mặc định là trung lập.

def analyze_message(message: str) -> tuple[IntentType, EmotionType]:
    intent = detect_intent(message)
    emotion = detect_emotion(message)

    return intent, emotion