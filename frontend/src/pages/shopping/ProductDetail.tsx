import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ShoppingCart, Heart, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { productService } from "@/services/product.service"
import type { ProductDetail as ProductModel, ProductVariant } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd, toNumber } from "@/lib/format"
import { getProductMainImage } from "@/lib/product"
import { useCartStore } from "@/store/cart.store"

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addLine = useCartStore((s) => s.addLine)

  const [product, setProduct] = useState<ProductModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [variantId, setVariantId] = useState<number | null>(null)
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined)

  useEffect(() => {
    const pid = Number(id)
    if (!Number.isFinite(pid)) {
      setError("ID sản phẩm không hợp lệ")
      setLoading(false)
      return
    }
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await productService.getById(pid)
        if (!data.success || !data.result) throw new Error(data.message || "Không tìm thấy sản phẩm")
        const p = data.result
        setProduct(p)
        const first = p.variants?.[0]
        setVariantId(first?.id ?? null)
        setActiveImage(getProductMainImage(p))
      } catch (e) {
        setError(getApiErrorMessage(e))
        setProduct(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const variant = useMemo(() => {
    if (!product?.variants?.length) return null
    return product.variants.find((v) => v.id === variantId) ?? product.variants[0]
  }, [product, variantId])

  const images = useMemo(() => {
    if (!product?.images?.length) return []
    return [...product.images].sort((a, b) => a.position - b.position)
  }, [product])

  const handleAddToCart = () => {
    if (!product || !variant) return
    const img = activeImage ?? getProductMainImage(product)
    addLine({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: toNumber(variant.price),
      quantity,
      imageUrl: img,
    })
    navigate("/cart")
  }

  if (loading) return <LoadingSpinner label="Đang tải chi tiết..." />
  if (error || !product) return <ErrorState message={error ?? "Không có dữ liệu"} />

  const inStock = (product.variants?.length ?? 0) > 0

  return (
    <div className="container py-8">
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Chưa có ảnh</div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    activeImage === img.url ? "border-primary ring-2 ring-primary/40" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{product.categoryName}</p>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.shortDesc}</p>
          </div>

          {variant ? (
            <div className="text-3xl font-bold text-primary">{formatVnd(toNumber(variant.price))}</div>
          ) : null}

          <div className="space-y-4 border-y border-border py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Biến thể (SKU)</label>
              <Select
                value={variantId?.toString() ?? ""}
                onChange={(e) => setVariantId(Number(e.target.value))}
                disabled={!product.variants?.length}
              >
                {product.variants?.map((v: ProductVariant) => (
                  <option key={v.id} value={v.id}>
                    {[v.sku, v.color, v.size].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Số lượng</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </Button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 rounded-md border border-border py-1 text-center text-sm"
                />
                <Button variant="outline" size="sm" type="button" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="h-11 w-full" disabled={!inStock} type="button" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11" type="button">
                <Heart className="mr-2 h-4 w-4" />
                Yêu thích
              </Button>
              <Button variant="outline" className="h-11" type="button">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          </div>

          <Card className="border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="text-sm">
                <p className="font-medium text-emerald-900">{inStock ? "Đang kinh doanh" : "Không có biến thể"}</p>
                <p className="text-emerald-800">Giao hàng dự kiến 2–5 ngày làm việc (demo)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {product.longDesc ? (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Mô tả chi tiết</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{product.longDesc}</div>
        </Card>
      ) : null}
    </div>
  )
}
