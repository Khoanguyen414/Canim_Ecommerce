import re
import unicodedata


def normalize_text(text: str) -> str:
    if text is None:
        return ""

    normalized = unicodedata.normalize("NFC", text)
    normalized = normalized.strip().lower()
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized
   
def contains_any(text: str, keywords: list[str]) -> bool:
    normalized_text = normalize_text(text)
    return any(keyword in normalized_text for keyword in keywords)
    