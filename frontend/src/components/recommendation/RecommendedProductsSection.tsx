import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProductTracking } from "@/hooks/useProductTracking"
import { formatVnd, toNumber } from "@/lib/format"
import { aiRecommendationService } from "@/services/aiRecommendation.service"
import type {
  AiRecommendedProduct,
  RecommendationSectionType,
} from "@/types/ai-recommendation"

type RecommendedProductsSectionProps = {
  type: RecommendationSectionType
  title?: string
  subtitle?: string
  userId?: number | null
  productId?: number | null
  query?: string | null
  limit?: number
  className?: string
}

const sectionTitleMap: Record<RecommendationSectionType, string> = {
  PERSONALIZED: "Dành cho bạn",
  TRENDING: "Sản phẩm đang hot",
  SIMILAR: "Sản phẩm tương tự",
  ALSO_VIEWED: "Khách cũng quan tâm",
}

const sectionSubtitleMap: Record<RecommendationSectionType, string> = {
  PERSONALIZED: "Gợi ý dựa trên sản phẩm bạn đã xem, tìm kiếm hoặc thêm vào giỏ.",
  TRENDING: "Những sản phẩm đang được nhiều khách quan tâm gần đây.",
  SIMILAR: "Các sản phẩm có danh mục, màu sắc, phong cách hoặc khoảng giá tương tự.",
  ALSO_VIEWED: "Một số lựa chọn khác mà khách hàng thường xem cùng.",
}

const getProductId = (product: AiRecommendedProduct) => {
  return product.productId ?? product.product_id ?? null
}

const getVariantId = (product: AiRecommendedProduct) => {
  return product.variantId ?? product.variant_id ?? null
}

const getProductName = (product: AiRecommendedProduct) => {
  return product.name ?? product.productName ?? "Sản phẩm Canim"
}

const getImageUrl = (product: AiRecommendedProduct) => {
  return product.imageUrl ?? product.image_url ?? product.mainImageUrl ?? null
}

function RecommendationCard({
  product,
  source,
}: {
  product: AiRecommendedProduct
  source: string
}) {
  const { trackProductClick } = useProductTracking()

  const productId = getProductId(product)
  const variantId = getVariantId(product)
  const imageUrl = getImageUrl(product)
  const productName = getProductName(product)
  const price = toNumber(product.price)
  const reasons = Array.isArray(product.recommendationReasons)
    ? product.recommendationReasons
    : []
  const href = productId ? `/products/${productId}` : "/products"

  const handleClick = () => {
    if (!productId) return

    trackProductClick({
      productId,
      variantId,
      source,
    })
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={href} onClick={handleClick} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Canim
            </div>
          )}

          {product.recommendationScore ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm">
              AI {Number(product.recommendationScore).toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 p-4">
          <div>
            <p className="line-clamp-1 text-sm font-bold text-neutral-900">
              {productName}
            </p>

            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
              {[product.categoryName, product.color, product.size].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-neutral-950">
              {price > 0 ? formatVnd(price) : "Liên hệ"}
            </p>

            <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              Gợi ý
            </span>
          </div>

          {reasons.length > 0 ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {reasons[0]}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

export default function RecommendedProductsSection({
  type,
  title,
  subtitle,
  userId,
  productId,
  query,
  limit = 8,
  className,
}: RecommendedProductsSectionProps) {
  const [items, setItems] = useState<AiRecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  const source = useMemo(() => {
    return `RECOMMENDATION_${type}`
  }, [type])

  useEffect(() => {
    let mounted = true

    setLoading(true)

    void aiRecommendationService
      .getRecommendations({
        sectionType: type,
        userId,
        productId,
        query,
        limit,
      })
      .then((response) => {
        if (!mounted) return

        setItems(response.items ?? [])
      })
      .finally(() => {
        if (!mounted) return

        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [type, userId, productId, query, limit])

  if (!loading && items.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            Canim AI
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-950">
            {title ?? sectionTitleMap[type]}
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            {subtitle ?? sectionSubtitleMap[type]}
          </p>
        </div>

        <Button variant="outline" type="button" className="rounded-full" onClick={() => undefined}>
          Xem thêm
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: Math.min(limit, 4) }).map((_, index) => (
            <div
              key={index}
              className="h-[320px] animate-pulse rounded-3xl bg-neutral-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.slice(0, limit).map((product, index) => (
            <RecommendationCard
              key={`${getProductId(product) ?? "mock"}_${getVariantId(product) ?? index}`}
              product={product}
              source={source}
            />
          ))}
        </div>
      )}
    </section>
  )
}