import { toNumber } from "@/lib/format"
import type { CartItemDto, CartLine } from "@/types/api.types"

export function buildLineId(productId: number, variantId: number) {
  return `${productId}-${variantId}`
}

export function mapCartItemToLine(item: CartItemDto, productId = 0): CartLine {
  return {
    lineId: String(item.variantId),
    cartItemId: item.id,
    productId,
    variantId: item.variantId,
    productName: item.productName,
    sku: item.sku,
    color: item.color,
    size: item.size,
    price: toNumber(item.unitPrice),
    quantity: item.quantity,
    imageUrl: item.imageUrl ?? undefined,
    isSelected: item.isSelected ?? true,
    isAvailable: item.isAvailable ?? true,
    warningMessage: item.warningMessage,
  }
}
