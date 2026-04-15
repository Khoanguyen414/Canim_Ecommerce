import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductDetail } from "@/types/api.types"
import { formatVnd } from "@/lib/format"
import { cn } from "@/utils/cn"

export interface HomeShowcaseCardProps {
  name: string
  imageUrl?: string
  href: string
  priceVnd: number
  originalVnd: number | null
  discountPercent: number
  rating: number
  reviewCount: number
  inStock: boolean
  verified: boolean
  /** Shown as "Sold: …" when set; hidden when null (e.g. live catalog) */
  soldLabel: string | null
  /** When set, shows quick add to cart */
  product?: ProductDetail
  onAddToCart?: (product: ProductDetail) => void
  /** Shows a small "Sample" ribbon when using mock data */
  isSample?: boolean
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rounded ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      <span className="text-sm text-gray-500">({reviewCount.toLocaleString("en-US")})</span>
    </div>
  )
}

export function HomeShowcaseCard({
  name,
  imageUrl,
  href,
  priceVnd,
  originalVnd,
  discountPercent,
  rating,
  reviewCount,
  inStock,
  verified,
  soldLabel,
  product,
  onAddToCart,
  isSample,
}: HomeShowcaseCardProps) {
  const [wish, setWish] = useState(false)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {isSample ? (
          <span className="absolute bottom-12 right-3 z-10 rounded-md bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            Sample
          </span>
        ) : null}

        {discountPercent > 0 ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            Save {discountPercent}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setWish((w) => !w)
          }}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition hover:scale-105",
            wish ? "text-red-500" : "text-gray-500",
          )}
          aria-label="Wishlist"
        >
          <Heart className={cn("h-4 w-4", wish && "fill-current")} />
        </button>

        <Link to={href} className="block h-full w-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />
        <span
          className={cn(
            "absolute bottom-3 left-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow",
            inStock ? "bg-emerald-600" : "bg-neutral-700",
          )}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={href} className="line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-gray-900 hover:text-orange-600">
          {name}
        </Link>

        <StarRating rating={rating} reviewCount={reviewCount} />

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-extrabold text-orange-600">{formatVnd(priceVnd)}</span>
          {originalVnd != null && originalVnd > priceVnd ? (
            <span className="text-sm text-gray-400 line-through">{formatVnd(originalVnd)}</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
          {soldLabel ? (
            <span className="text-gray-500">
              Sold: <span className="font-semibold text-gray-700">{soldLabel}</span>
            </span>
          ) : (
            <span className="text-gray-400">Store catalog</span>
          )}
          {verified ? (
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Verified
            </span>
          ) : (
            <span className="text-gray-400" />
          )}
        </div>

        {product && onAddToCart ? (
          <Button
            type="button"
            size="sm"
            disabled={!inStock}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-white hover:from-orange-600 hover:to-red-600"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Quick add
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full rounded-xl font-semibold" asChild>
            <Link to="/products">Browse catalog</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
