"""Compare admin products API vs AI product context from the same backend."""
from __future__ import annotations

import json
import sys
from collections import Counter
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = "http://localhost:8000/canim_ecommerce"
AI_CONTEXT_URL = f"{BASE}/ai/products/context"
ADMIN_PRODUCTS_URL = f"{BASE}/products?pageNum=1&sizePage=200"


def fetch_json(url: str) -> object:
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def extract_admin_products(payload: object) -> list[dict]:
    if isinstance(payload, dict):
        for key in ("content", "items", "data", "result"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
            if isinstance(value, dict):
                nested = extract_admin_products(value)
                if nested:
                    return nested
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []


def main() -> int:
    print("=== Kiem tra ket noi san pham Admin vs AI ===\n")
    print(f"Backend base: {BASE}\n")

    try:
        ai_items = fetch_json(AI_CONTEXT_URL)
        admin_payload = fetch_json(ADMIN_PRODUCTS_URL)
    except (HTTPError, URLError, TimeoutError) as error:
        print(f"LOI: Khong goi duoc backend - {error}")
        return 1

    if not isinstance(ai_items, list):
        print("LOI: /ai/products/context khong tra ve list")
        return 1

    admin_products = extract_admin_products(admin_payload)
    active_admin = [
        product
        for product in admin_products
        if str(product.get("status", "")).upper() == "ACTIVE"
    ]

    ai_product_ids = {
        item.get("productId") or item.get("product_id")
        for item in ai_items
        if isinstance(item, dict)
    }
    ai_product_ids.discard(None)

    ai_names = Counter(
        item.get("name", "?")
        for item in ai_items
        if isinstance(item, dict)
    )

    print(f"Admin API (/products): {len(admin_products)} san pham (tat ca trang thai)")
    print(f"Admin ACTIVE:           {len(active_admin)} san pham")
    print(f"AI context (/ai/products/context): {len(ai_items)} variant co the ban")
    print(f"AI unique product_id:   {len(ai_product_ids)}\n")

    print("--- Mau AI context (10 dong dau) ---")
    for item in ai_items[:10]:
        if not isinstance(item, dict):
            continue
        print(
            f"  {item.get('name')} | productId={item.get('productId')} "
            f"variantId={item.get('variantId')} | {item.get('color')} / {item.get('size')} "
            f"| stock={item.get('availableQuantity')} | status={item.get('status')}"
        )

    if len(ai_items) > 10:
        print(f"  ... va {len(ai_items) - 10} variant khac\n")
    else:
        print()

    print("--- Ten san pham AI biet (unique) ---")
    for name, count in ai_names.most_common(20):
        suffix = f" ({count} variant)" if count > 1 else ""
        print(f"  - {name}{suffix}")

    print("\n--- Ket luan ---")
    if len(ai_items) == 0:
        print("AI chua co san pham nao. Kiem tra:")
        print("  - San pham ACTIVE trong admin?")
        print("  - Variant isActive = true?")
        print("  - Ton kho > 0?")
        return 0

    if len(ai_items) < len(active_admin):
        print(
            "AI chi thay it hon so ACTIVE trong admin vi API context loc theo variant "
            "ACTIVE + con hang (availableQuantity > 0)."
        )
    else:
        print("Ket noi OK: AI lay du lieu tu cung backend Spring Boot ma admin dung.")

    print("\nAdmin-frontend KHONG noi truc tiep voi AI.")
    print("Admin -> GET /products (can JWT)")
    print("AI     -> GET /ai/products/context (public, tu backend)")
    print("Ca hai cung nguon database, khac endpoint va bo loc.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
