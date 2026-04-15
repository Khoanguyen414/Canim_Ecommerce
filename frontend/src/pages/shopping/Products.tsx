import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import ProductCard from "@/components/product/ProductCard"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { EmptyState } from "@/components/common/EmptyState"
import { PackageOpen } from "lucide-react"
import { usePublicProducts } from "@/hooks/usePublicProducts"
import { categoryService } from "@/services/category.service"
import type { CategoryNode, ProductDetail } from "@/types/api.types"
import { getApiErrorMessage } from "@/lib/apiError"
import { useCartStore } from "@/store/cart.store"
import { getDefaultVariant, getProductMainImage } from "@/lib/product"
import { toNumber } from "@/lib/format"
import { useNavigate } from "react-router-dom"

export default function Products() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addLine = useCartStore((s) => s.addLine)
  const {
    page,
    setPage,
    keyword,
    setKeyword,
    categoryId,
    setCategoryId,
    products,
    totalPages,
    loading,
    error,
    reload,
  } = usePublicProducts(12)

  const [roots, setRoots] = useState<CategoryNode[]>([])
  const [catLoading, setCatLoading] = useState(true)

  useEffect(() => {
    const raw = searchParams.get("categoryId")
    if (raw) {
      const n = Number(raw)
      if (Number.isFinite(n)) setCategoryId(n)
    }
  }, [searchParams, setCategoryId])

  useEffect(() => {
    const q = searchParams.get("q")
    if (q !== null) setKeyword(q)
  }, [searchParams, setKeyword])

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await categoryService.getRoots()
        if (data.success && data.result) setRoots(data.result)
      } catch (e) {
        console.error(getApiErrorMessage(e))
      } finally {
        setCatLoading(false)
      }
    })()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Public catalog with pagination</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="space-y-6 p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <Settings className="h-4 w-4" />
              Filters
            </h3>
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="text-sm font-medium">Keyword</label>
              <Input
                placeholder="Product name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Apply
              </Button>
            </form>
            <div className="space-y-2">
              <label className="text-sm font-medium">Root category</label>
              <Select
                value={categoryId?.toString() ?? ""}
                onChange={(e) => {
                  const v = e.target.value
                  setCategoryId(v ? Number(v) : undefined)
                  setPage(1)
                }}
                disabled={catLoading}
              >
                <option value="">All</option>
                {roots.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {loading ? <LoadingSpinner label="Đang tải sản phẩm..." /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}
          {!loading && !error && products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No products found"
              description="Try a different keyword or category."
              actionLabel="Clear filters"
              onAction={() => {
                setKeyword("")
                setCategoryId(undefined)
                setPage(1)
              }}
            />
          ) : null}

          {!loading && !error && products.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleQuickAdd} />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
