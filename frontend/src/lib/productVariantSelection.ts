import type { ProductVariant } from "@/types/api.types"
import { FILTER_SIZES } from "@/config/productFacets"

function normColor(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function normSize(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase()
}

export function getDistinctColors(variants: ProductVariant[]): string[] {
  const map = new Map<string, string>()
  for (const variant of variants) {
    const raw = variant.color?.trim()
    if (!raw) continue
    const key = normColor(raw)
    if (!map.has(key)) map.set(key, raw)
  }
  return [...map.values()].sort((a, b) => a.localeCompare(b, "vi"))
}

export function productHasSizes(variants: ProductVariant[]): boolean {
  return variants.some((v) => Boolean(v.size?.trim()))
}

export function getSizeOptionsForColor(
  variants: ProductVariant[],
  selectedColor: string | null,
): { size: string; variant: ProductVariant }[] {
  let pool = variants.filter((v) => v.size?.trim())
  if (selectedColor) {
    const colorKey = normColor(selectedColor)
    pool = pool.filter((v) => normColor(v.color) === colorKey)
  }

  const bySize = new Map<string, ProductVariant>()
  for (const variant of pool) {
    const size = normSize(variant.size)
    if (!bySize.has(size)) bySize.set(size, variant)
  }

  const ordered = FILTER_SIZES.filter((s) => bySize.has(s))
  const extras = [...bySize.keys()].filter((s) => !FILTER_SIZES.includes(s as (typeof FILTER_SIZES)[number]))
  return [...ordered, ...extras].map((size) => ({
    size,
    variant: bySize.get(size)!,
  }))
}

export function resolveVariantSelection(
  variants: ProductVariant[],
  selectedColor: string | null,
  selectedSize: string | null,
): ProductVariant | null {
  if (!variants.length) return null

  const colors = getDistinctColors(variants)
  const hasColors = colors.length > 0
  const hasSizes = productHasSizes(variants)

  if (variants.length === 1 && !hasColors && !hasSizes) {
    return variants[0]
  }

  if (hasColors && !selectedColor) return null
  if (hasSizes && !selectedSize) return null

  return (
    variants.find((variant) => {
      const colorOk = !hasColors || normColor(variant.color) === normColor(selectedColor)
      const sizeOk = !hasSizes || normSize(variant.size) === normSize(selectedSize)
      return colorOk && sizeOk
    }) ?? null
  )
}

export function getVariantSelectionError(
  variants: ProductVariant[],
  selectedColor: string | null,
  selectedSize: string | null,
  resolved: ProductVariant | null,
): string | null {
  if (!variants.length) return "Sản phẩm chưa có biến thể."

  const colors = getDistinctColors(variants)
  const hasColors = colors.length > 0
  const hasSizes = productHasSizes(variants)

  if (variants.length === 1 && !hasColors && !hasSizes) return null

  if (hasColors && !selectedColor) return "Vui lòng chọn màu trước khi mua."
  if (hasSizes && !selectedSize) return "Vui lòng chọn size trước khi mua."
  if (!resolved) return "Không tìm thấy biến thể phù hợp — chọn lại màu và size."

  const qty = resolved.quantity
  if (qty != null && qty <= 0) return "Biến thể đã chọn hiện hết hàng."

  return null
}

export function variantInStock(variant: ProductVariant | null): boolean {
  if (!variant) return false
  return variant.quantity == null || variant.quantity > 0
}

/** SP có màu/size hoặc nhiều biến thể → phải vào trang chi tiết trước khi thêm giỏ. */
export function requiresVariantSelection(variants: ProductVariant[]): boolean {
  if (!variants.length) return false
  if (variants.length === 1 && getDistinctColors(variants).length === 0 && !productHasSizes(variants)) {
    return false
  }
  if (getDistinctColors(variants).length > 0) return true
  if (productHasSizes(variants)) return true
  return variants.length > 1
}
