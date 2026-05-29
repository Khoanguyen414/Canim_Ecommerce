import { Link } from "react-router-dom"
import { Check, Heart, ShoppingBag } from "lucide-react"
import type { ProductDetail } from "@/types/api.types"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/cn"
import { getMinVariantPrice, getProductMainImage } from "@/lib/product"
import { productToWishlistItem, useWishlistStore } from "@/store/wishlist.store"
import { resolveColorCss, uniqueVariantColorLabels } from "@/lib/colorSwatch"
import { useProductTracking } from "@/hooks/useProductTracking"

export interface ProductCardViewProps {
  name: string
  imageUrl?: string
  href: string
  priceVnd: number
  inStock: boolean
  isNew?: boolean
  colorCss?: string | null
  colorLabel?: string | null
  product?: ProductDetail
  onAddToCart?: (product: ProductDetail) => void

  originalVnd?: number | null
  discountPercent?: number
  rating?: number
  reviewCount?: number
  verified?: boolean
  soldLabel?: string | null
  isSample?: boolean
  showBrowseFallback?: boolean
}

function isLightSwatch(css: string): boolean {
  const h = css.toLowerCase()

  if (
    h.includes("fafafa") ||
    h.includes("fde68a") ||
    h.includes("d4b896") ||
    h === "#fff" ||
    h === "#ffffff"
  ) {
    return true
  }

  const hsl = h.match(/hsl\([^,]+,\s*[^,]+,\s*(\d+(?:\.\d+)?)/)
  if (hsl) return parseFloat(hsl[1]) > 72

  return false
}

export function ProductCardView({
  name,
  imageUrl,
  href,
  priceVnd,
  inStock,
  isNew,
  colorCss,
  colorLabel,
  product,
  onAddToCart,
  isSample,
}: ProductCardViewProps) {
  const productId = product?.id
  const isWishlisted = useWishlistStore((s) =>
    productId != null ? s.isWishlisted(productId) : false,
  )
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const swatch = colorCss ?? null
  const light = swatch ? isLightSwatch(swatch) : false
  const canAdd = Boolean(product && onAddToCart && inStock)
  const { trackProductClick } = useProductTracking()

  const handleTrackProductClick = () => {
    if (!product?.id) return

    trackProductClick({
      productId: product.id,
      variantId: product.variants?.[0]?.id ?? null,
      source: isSample ? "AI_RECOMMENDATION_CARD" : "PRODUCT_CARD",
    })
  }

  return (
    <article className="group flex h-full flex-col bg-white">
      <Link
        to={href}
        onClick={handleTrackProductClick}
        className="relative block aspect-[3/4] overflow-hidden bg-neutral-100"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No image
          </div>
        )}

        {isNew ? (
          <span className="absolute left-3 top-3 z-10 bg-[#e85d04] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            NEW
          </span>
        ) : null}

        {isSample ? (
          <span className="absolute right-3 top-3 z-10 bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Gợi ý
          </span>
        ) : null}

        {!inStock ? (
          <span className="absolute bottom-3 left-3 z-10 bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Hết hàng
          </span>
        ) : null}
      </Link>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        {swatch ? (
          <span
            title={colorLabel ?? undefined}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
              light ? "border-neutral-300" : "border-neutral-200/80",
            )}
            style={{ backgroundColor: swatch }}
          >
            <Check
              className={cn("h-3 w-3", light ? "text-neutral-800" : "text-white")}
              strokeWidth={3}
            />
          </span>
        ) : (
          <span className="h-6 w-6 shrink-0" aria-hidden />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (product) toggleWishlist(productToWishlistItem(product))
          }}
          className={cn(
            "ml-auto flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900",
            isWishlisted && "text-red-500",
          )}
          aria-label={isWishlisted ? "Bỏ yêu thích" : "Thêm yêu thích"}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={cn("h-[18px] w-[18px] stroke-[1.5]", isWishlisted && "fill-current")}
          />
        </button>
      </div>

      <Link
        to={href}
        onClick={handleTrackProductClick}
        className="mt-2 line-clamp-1 text-[13px] font-normal leading-snug text-neutral-800 transition-colors hover:text-neutral-950"
      >
        {name}
      </Link>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[15px] font-bold tracking-tight text-neutral-900">
          {formatVnd(priceVnd)}
        </p>

        <button
          type="button"
          disabled={!canAdd}
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Thêm vào giỏ"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (product && onAddToCart) onAddToCart(product)
          }}
        >
          <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>
    </article>
  )
}

interface ProductCardProps {
  product: ProductDetail
  onAddToCart?: (product: ProductDetail) => void
}

function isNewProduct(createdAt?: string): boolean {
  if (!createdAt) return false

  const created = new Date(createdAt).getTime()

  if (Number.isNaN(created)) return false

  return Date.now() - created < 30 * 24 * 60 * 60 * 1000
}

export function buildProductCardProps(
  p: ProductDetail,
  onAddToCart?: (product: ProductDetail) => void,
): ProductCardViewProps {
  const colors = uniqueVariantColorLabels(p, 1)
  const primary = colors[0]

  return {
    name: p.name,
    imageUrl: getProductMainImage(p),
    href: `/products/${p.id}`,
    priceVnd: getMinVariantPrice(p),
    inStock: (p.variants?.length ?? 0) > 0,
    isNew: isNewProduct(p.createdAt),
    colorCss: primary ? resolveColorCss(primary) : null,
    colorLabel: primary ?? null,
    product: p,
    onAddToCart,
  }
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return <ProductCardView {...buildProductCardProps(product, onAddToCart)} />
}