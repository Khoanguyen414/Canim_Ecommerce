import type { ProductDetail } from "@/types/api.types"
import type { HomeShowcaseCardProps } from "@/components/home/HomeShowcaseCard"
import { getMaxVariantPrice, getMinVariantPrice, getProductMainImage } from "@/lib/product"

export function buildShowcasePropsFromProduct(
  p: ProductDetail,
  onAddToCart?: (product: ProductDetail) => void,
): HomeShowcaseCardProps {
  const min = getMinVariantPrice(p)
  const max = getMaxVariantPrice(p)
  const inStock = (p.variants?.length ?? 0) > 0
  const discount =
    max > min && min > 0 ? Math.round((1 - min / max) * 100) : 0
  const rating = Math.min(4.9, 4 + (p.id % 10) / 10)
  const reviewCount = 50 + (p.id * 37) % 2500

  return {
    name: p.name,
    imageUrl: getProductMainImage(p),
    href: `/products/${p.id}`,
    priceVnd: min,
    originalVnd: max > min ? max : null,
    discountPercent: discount,
    rating,
    reviewCount,
    inStock,
    verified: p.status === "ACTIVE",
    soldLabel: null,
    product: p,
    onAddToCart,
    isSample: false,
  }
}
