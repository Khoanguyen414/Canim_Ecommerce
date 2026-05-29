import { useEffect, useRef } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react"

import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import ProductCard from "@/components/product/ProductCard"
import { ProductFacetSidebar } from "@/components/shop/ProductFacetSidebar"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  getProductPageMeta,
  hasActiveFacets,
  legacyQueryToFacets,
  productsUrl,
  SORT_OPTIONS,
  type ProductFacetParams,
} from "@/config/productFacets"
import { useProductFacetParams } from "@/hooks/useProductFacetParams"
import { useProductTracking } from "@/hooks/useProductTracking"
import { usePublicProducts } from "@/hooks/usePublicProducts"
import { formatVnd, toNumber } from "@/lib/format"
import { getDefaultVariant, getProductMainImage } from "@/lib/product"
import { useCartStore } from "@/store/cart.store"
import type { ProductDetail } from "@/types/api.types"

export default function Products() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addLine = useCartStore((s) => s.addLine)
  const { facets, page, patchFacets, applyFacets, clearFacets, setPage } = useProductFacetParams()
  const trackedSearchRef = useRef<Set<string>>(new Set())
  const { trackSearch } = useProductTracking()

  const { products, totalPages, loading, error, reload } = usePublicProducts(facets, page, 12)
  const { title, breadcrumbs } = getProductPageMeta(facets)
  const filtered = hasActiveFacets(facets)

  useEffect(() => {
    const q = searchParams.get("q")
    const keyword = q?.trim()

    if (!keyword) return

    if (!trackedSearchRef.current.has(keyword)) {
      trackedSearchRef.current.add(keyword)

      trackSearch({
        keyword,
        source: "PRODUCTS_QUERY_PARAM",
      })
    }

    const hasStructured = Boolean(
      searchParams.get("gender") ||
        searchParams.get("group") ||
        searchParams.get("facet") ||
        searchParams.get("collection") ||
        searchParams.get("categoryId"),
    )

    if (hasStructured) return

    const migrated = legacyQueryToFacets(keyword)

    if (migrated) {
      applyFacets(migrated, 1)
    }
  }, [searchParams, applyFacets, trackSearch])

  const handleQuickAdd = (p: ProductDetail) => {
    const v = getDefaultVariant(p)

    if (!v) return

    addLine({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      sku: v.sku,
      color: v.color,
      size: v.size,
      price: toNumber(v.price),
      quantity: 1,
      imageUrl: getProductMainImage(p),
    })

    navigate("/cart")
  }

  const handleSidebarApply = (draft: ProductFacetParams) => {
    applyFacets(draft, 1)
  }

  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(totalPages - 4, page - 3)) + i,
  ).filter((n) => n <= totalPages)

  return (
    <div className="container py-8 md:py-10">
      <nav className="mb-4 text-xs text-neutral-600">
        {breadcrumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`}>
            {i > 0 ? <span className="mx-1.5">/</span> : null}

            {crumb.facets ? (
              <Link to={productsUrl(crumb.facets)} className="hover:text-primary hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <Link to="/" className="hover:text-primary hover:underline">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFacetSidebar facets={facets} onApply={handleSidebarApply} onClear={clearFacets} />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <h1 className="text-xl font-bold tracking-wide text-neutral-900 md:text-2xl">{title}</h1>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-600">Sắp xếp theo</span>

              <Select
                className="min-w-[200px] rounded-none border-neutral-300"
                value={facets.sortBy ?? "default"}
                onChange={(e) =>
                  patchFacets({ sortBy: e.target.value as ProductFacetParams["sortBy"] }, 1)
                }
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? <LoadingSpinner label="Đang tải sản phẩm..." /> : null}

          {!loading && error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}

          {!loading && !error && products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="Không tìm thấy sản phẩm phù hợp"
              description={
                filtered
                  ? "Thử bỏ bớt size/màu/giá hoặc chọn danh mục rộng hơn (vd. Áo nam)."
                  : "Chưa có sản phẩm trong danh mục này."
              }
              actionLabel="Xóa bộ lọc"
              onAction={clearFacets}
            />
          ) : null}

          {!loading && !error && products.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-neutral-500">
                Trang {page} / {totalPages} · {products.length} sản phẩm
              </p>

              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleQuickAdd} />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>

                {pageNumbers.map((n) => (
                  <Button
                    key={n}
                    variant={n === page ? "default" : "outline"}
                    onClick={() => setPage(n)}
                    className="min-w-10"
                  >
                    {n}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}