import type { InboundItemPayload } from "@/types/api"
import type { VariantPreviewRow } from "@/lib/productVariants"

export type CreatedVariantRef = {
  id?: number | null
  sku?: string | null
  price?: number | null
}

/** Ghép variant vừa tạo (có id) với ma trận stock theo SKU. */
export function buildInitialInboundItems(
  createdVariants: CreatedVariantRef[],
  previews: VariantPreviewRow[],
  fallbackUnitPrice: number,
): InboundItemPayload[] {
  const stockBySku = new Map(
    previews.filter((row) => row.stock > 0).map((row) => [row.skuPreview, row.stock]),
  )

  const items: InboundItemPayload[] = []

  for (const variant of createdVariants) {
    if (variant.id == null || !variant.sku) continue
    const quantity = stockBySku.get(variant.sku)
    if (!quantity || quantity <= 0) continue

    const fromVariant = variant.price != null ? Number(variant.price) : NaN
    const price = Number.isFinite(fromVariant) && fromVariant >= 0 ? fromVariant : fallbackUnitPrice

    items.push({
      variantId: Number(variant.id),
      quantity,
      price,
    })
  }

  return items
}

export function formatInboundSummary(items: InboundItemPayload[]): string {
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
  return `${items.length} biến thể, ${totalQty} sản phẩm`
}
