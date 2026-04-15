import type { ProductDetail } from "@/types/api.types"
import { toNumber } from "@/lib/format"

export function getProductMainImage(p: ProductDetail): string | undefined {
  const imgs = [...(p.images ?? [])].sort((a, b) => a.position - b.position)
  const main = imgs.find((i) => i.isMain) ?? imgs[0]
  return main?.url
}

export function getMinVariantPrice(p: ProductDetail): number {
  if (!p.variants?.length) return 0
  return Math.min(...p.variants.map((v) => toNumber(v.price)))
}

export function getMaxVariantPrice(p: ProductDetail): number {
  if (!p.variants?.length) return 0
  return Math.max(...p.variants.map((v) => toNumber(v.price)))
}

export function getDefaultVariant(p: ProductDetail) {
  return p.variants?.[0]
}
