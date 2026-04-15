import { ShoppingCart, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProductDetail } from "@/types/api.types"
import { formatVnd } from "@/lib/format"
import { getMinVariantPrice, getProductMainImage } from "@/lib/product"
import { resolveColorCss, uniqueVariantColorLabels } from "@/lib/colorSwatch"

interface ProductCardProps {
  product: ProductDetail
  onAddToCart?: (product: ProductDetail) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const img = getProductMainImage(product)
  const price = getMinVariantPrice(product)
  const inStock = (product.variants?.length ?? 0) > 0
  const colors = uniqueVariantColorLabels(product, 5)
  const totalColorLabels = new Set(
    (product.variants ?? []).map((v) => v.color?.trim().toLowerCase()).filter(Boolean) as string[],
  ).size
  const extraColors = Math.max(0, totalColorLabels - colors.length)

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/15">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-primary/20 via-fuchsia-500/10 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <Link to={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-b from-muted/80 to-muted">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-100/80 via-rose-50 to-amber-50 text-sm text-muted-foreground dark:from-violet-950/40 dark:via-rose-950/30 dark:to-amber-950/20">
            <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">No image</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
          {product.categoryName ? (
            <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-800 shadow-sm backdrop-blur-sm dark:bg-neutral-900/90 dark:text-neutral-100">
              {product.categoryName}
            </span>
          ) : null}
          {product.status === "ACTIVE" ? (
            <Badge className="border-0 bg-emerald-500/95 text-white shadow-sm backdrop-blur-sm hover:bg-emerald-600">On sale</Badge>
          ) : null}
          {!inStock ? (
            <Badge variant="secondary" className="bg-neutral-900/80 text-white">
              Out of stock
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col justify-between gap-3 p-4 pt-3">
        <div className="space-y-2">
          <Link to={`/products/${product.id}`}>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>

          {colors.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Colors</span>
              <div className="flex flex-wrap items-center gap-1">
                {colors.map((c) => (
                  <span
                    key={c}
                    title={c}
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 dark:border-neutral-800"
                    style={{ backgroundColor: resolveColorCss(c) }}
                  />
                ))}
                {extraColors > 0 ? (
                  <span className="text-[10px] font-medium text-muted-foreground">+{extraColors}</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">Popular</span>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-border/50 pt-3">
          <p className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-xl font-bold text-transparent dark:from-rose-400 dark:to-fuchsia-400">
            {formatVnd(price)}
          </p>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-primary to-rose-600 font-semibold shadow-md transition hover:from-primary/90 hover:to-rose-600/90 hover:shadow-lg dark:from-rose-600 dark:to-fuchsia-700"
            size="sm"
            disabled={!inStock}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onAddToCart?.(product)
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Quick add
          </Button>
        </div>
      </div>
    </div>
  )
}
