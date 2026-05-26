import type { ProductDetail } from "@/types/api.types"
import {
  buildProductCardProps,
  type ProductCardViewProps,
} from "@/components/product/ProductCard"

/** @deprecated Dùng `buildProductCardProps` */
export function buildShowcasePropsFromProduct(
  p: ProductDetail,
  onAddToCart?: (product: ProductDetail) => void,
): ProductCardViewProps {
  return buildProductCardProps(p, onAddToCart)
}
