import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ChevronRight, ShoppingCart, Heart, GitCompare } from "lucide-react"
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
import {
  getDistinctColors,
  getSizeOptionsForColor,
  getVariantSelectionError,
  productHasSizes,
  resolveVariantSelection,
  variantInStock,
} from "@/lib/productVariantSelection"
import { useCartStore } from "@/store/cart.store"
import { productToWishlistItem, useWishlistStore } from "@/store/wishlist.store"
import { cn } from "@/lib/cn"
import { ShopSidebar } from "@/components/shop/ShopSidebar"
import { ProductReviewsSection } from "@/components/reviews/ProductReviewsSection"

export default function ProductDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const orderItemIdParam = searchParams.get("orderItemId")
  const orderItemId = orderItemIdParam ? Number(orderItemIdParam) : null
  const navigate = useNavigate()
  const addLine = useCartStore((s) => s.addLine)
  const toggleWishlist = useWishlistStore((s) => s.toggle)

  const [product, setProduct] = useState<ProductModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [legacyVariantId, setLegacyVariantId] = useState<number | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined)
  const [tab, setTab] = useState<"desc" | "info" | "reviews">(
    orderItemId ? "reviews" : "desc",
  )

  useEffect(() => {
    if (orderItemId) setTab("reviews")
  }, [orderItemId])

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
      setSelectedColor(null)
      setSelectedSize(null)
      setLegacyVariantId(null)
      setSelectionError(null)
      setQuantity(1)
      try {
        const { data } = await productService.getPublicById(pid)
        if (!data.success || !data.result) throw new Error(data.message || "Không tìm thấy sản phẩm")
        const p = data.result
        setProduct(p)
        setActiveImage(getProductMainImage(p))
      } catch (e) {
        setError(getApiErrorMessage(e))
        setProduct(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const variants = product?.variants ?? []
  const colorOptions = useMemo(() => getDistinctColors(variants), [variants])
  const hasColorPicker = colorOptions.length > 0
  const hasSizePicker = productHasSizes(variants)

  const sizeOptions = useMemo(
    () => getSizeOptionsForColor(variants, selectedColor),
    [variants, selectedColor],
  )

  const usesLegacyVariantSelect =
    !hasSizePicker && (variants.length ?? 0) > 1

  const variant = useMemo(() => {
    if (usesLegacyVariantSelect) {
      if (!legacyVariantId) return null
      return variants.find((v) => v.id === legacyVariantId) ?? null
    }
    return resolveVariantSelection(variants, selectedColor, selectedSize)
  }, [variants, selectedColor, selectedSize, legacyVariantId, usesLegacyVariantSelect])

  const validationMessage = useMemo(() => {
    if (usesLegacyVariantSelect) {
      if (!legacyVariantId) return "Vui lòng chọn biến thể trước khi mua."
      const picked = variants.find((v) => v.id === legacyVariantId)
      if (picked && !variantInStock(picked)) return "Biến thể đã chọn hiện hết hàng."
      return null
    }
    return getVariantSelectionError(variants, selectedColor, selectedSize, variant)
  }, [usesLegacyVariantSelect, legacyVariantId, variants, selectedColor, selectedSize, variant])

  const images = useMemo(() => {
    if (!product?.images?.length) return []
    return [...product.images].sort((a, b) => a.position - b.position)
  }, [product])

  const productIdNum = Number(id)
  const isWishlisted = useWishlistStore((s) =>
    Number.isFinite(productIdNum) ? s.isWishlisted(productIdNum) : false,
  )

  const handleToggleWishlist = () => {
    if (!product) return
    toggleWishlist(productToWishlistItem(product))
  }

  const handleSelectColor = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null)
    setSelectionError(null)
  }

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    setSelectionError(null)
  }

  const handleAddToCart = () => {
    if (!product) return
    const message = validationMessage
    if (message || !variant) {
      setSelectionError(message ?? "Vui lòng chọn màu và size trước khi mua.")
      return
    }

    const maxQty = variant.quantity ?? quantity
    const safeQty = Math.min(Math.max(1, quantity), maxQty > 0 ? maxQty : quantity)

    const img = activeImage ?? getProductMainImage(product)
    addLine({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: toNumber(variant.price),
      quantity: safeQty,
      imageUrl: img,
    })
    navigate("/cart")
  }

  if (loading) return <LoadingSpinner label="Đang tải chi tiết..." />
  if (error || !product) return <ErrorState message={error ?? "Không có dữ liệu"} />

  const inStock = variantInStock(variant)
  const price = variant ? toNumber(variant.price) : toNumber(variants[0]?.price)
  const canAddToCart = !validationMessage && inStock && Boolean(variant)

  return (
    <div className="container py-6">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        <Link to="/products" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        <span className="line-clamp-1 text-gray-800">{product.categoryName}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        <span className="line-clamp-1 font-medium text-[#253d4e]">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm lg:grid-cols-2 lg:p-8">
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-xl border border-gray-100 bg-[#f8f8f8]">
                {activeImage ? (
                  <img src={activeImage} alt={product.name} className="h-full w-full object-contain" />
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
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        activeImage === img.url ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-5">
              <div>
                <span className="mb-2 inline-block rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                  Sale
                </span>
                <h1 className="text-2xl font-bold leading-tight text-[#253d4e] md:text-3xl">{product.name}</h1>
                <p className="mt-2 text-sm text-gray-500">SKU: {variant?.sku ?? "—"}</p>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">{formatVnd(price)}</span>
              </div>

              {product.shortDesc ? <p className="text-sm leading-relaxed text-gray-600">{product.shortDesc}</p> : null}

              <div className="space-y-4 border-y border-gray-100 py-4">
                {hasColorPicker ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#253d4e]">
                      Màu sắc <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => {
                        const active = selectedColor?.toLowerCase() === color.toLowerCase()
                        const colorVariants = variants.filter(
                          (v) => v.color?.trim().toLowerCase() === color.toLowerCase(),
                        )
                        const colorInStock = colorVariants.some((v) => variantInStock(v))
                        return (
                          <button
                            key={color}
                            type="button"
                            disabled={!colorInStock}
                            onClick={() => handleSelectColor(color)}
                            className={cn(
                              "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                              active
                                ? "border-primary bg-primary text-white"
                                : colorInStock
                                  ? "border-gray-300 text-[#253d4e] hover:border-primary"
                                  : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through",
                            )}
                          >
                            {color}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {hasSizePicker ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#253d4e]">
                      Size <span className="text-rose-500">*</span>
                    </label>
                    {hasColorPicker && !selectedColor ? (
                      <p className="text-sm text-gray-500">Chọn màu trước, sau đó chọn size.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions.map(({ size, variant: sizeVariant }) => {
                          const sizeInStock = variantInStock(sizeVariant)
                          const active = selectedSize === size
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={!sizeInStock}
                              onClick={() => handleSelectSize(size)}
                              className={cn(
                                "min-w-[2.75rem] rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                                active
                                  ? "border-primary bg-primary text-white"
                                  : sizeInStock
                                    ? "border-gray-300 text-[#253d4e] hover:border-primary"
                                    : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through",
                              )}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {usesLegacyVariantSelect ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#253d4e]">
                      Biến thể <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={legacyVariantId?.toString() ?? ""}
                      onChange={(e) => {
                        const next = e.target.value ? Number(e.target.value) : null
                        setLegacyVariantId(next)
                        setSelectionError(null)
                      }}
                    >
                      <option value="">— Chọn biến thể —</option>
                      {variants.map((v: ProductVariant) => (
                        <option key={v.id} value={v.id} disabled={!variantInStock(v)}>
                          {[v.sku, v.color, v.size].filter(Boolean).join(" · ")}
                          {!variantInStock(v) ? " (hết hàng)" : ""}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#253d4e]">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                      -
                    </Button>
                    <input
                      type="number"
                      min={1}
                      max={variant?.quantity ?? undefined}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 rounded-md border border-gray-200 py-1.5 text-center text-sm"
                      disabled={!canAddToCart}
                    />
                    <Button variant="outline" size="sm" type="button" onClick={() => setQuantity((q) => q + 1)}>
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {selectionError || validationMessage ? (
                <p className="text-sm font-medium text-rose-600" role="alert">
                  {selectionError ?? validationMessage}
                </p>
              ) : null}

              {!canAddToCart && variant && !inStock ? (
                <p className="text-sm text-rose-600">Biến thể đã chọn hiện hết hàng.</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="min-h-11 flex-1 bg-primary font-bold hover:bg-primary/90 sm:flex-none sm:px-10"
                  disabled={!canAddToCart}
                  type="button"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className={cn("h-11 w-11 shrink-0", isWishlisted && "border-red-200 text-red-500")}
                  aria-label={isWishlisted ? "Bỏ yêu thích" : "Thêm yêu thích"}
                  aria-pressed={isWishlisted}
                  onClick={handleToggleWishlist}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </Button>
                <Button variant="outline" size="icon" type="button" className="h-11 w-11 shrink-0" aria-label="Compare">
                  <GitCompare className="h-5 w-5" />
                </Button>
              </div>

              {!canAddToCart && (hasColorPicker || hasSizePicker) ? (
                <p className="text-xs text-gray-500">
                  Chọn đủ màu và size để thêm vào giỏ và tiếp tục thanh toán.
                </p>
              ) : null}

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#f4f6f8] p-3">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-semibold text-[#253d4e]">{product.categoryName}</dd>
                </div>
                <div className="rounded-lg bg-[#f4f6f8] p-3">
                  <dt className="text-gray-500">Stock</dt>
                  <dd className="font-semibold text-primary">
                    {variant && inStock
                      ? variant.quantity != null
                        ? `${variant.quantity} có sẵn`
                        : "In stock"
                      : variant && !inStock
                        ? "Hết hàng"
                        : "Chọn màu & size"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Card className="overflow-hidden border-gray-200/80 shadow-sm">
            <div className="flex flex-wrap border-b border-gray-100 bg-white">
              {(
                [
                  { id: "desc" as const, label: "Description" },
                  { id: "info" as const, label: "Additional info" },
                  { id: "reviews" as const, label: "Reviews" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                    tab === t.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-[#253d4e]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {tab === "desc" ? (
                product.longDesc ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-600">{product.longDesc}</div>
                ) : (
                  <p className="text-sm text-gray-500">No long description for this product.</p>
                )
              ) : null}
              {tab === "info" ? (
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <span className="font-semibold text-[#253d4e]">Category: </span>
                    {product.categoryName}
                  </li>
                  <li>
                    <span className="font-semibold text-[#253d4e]">Variants: </span>
                    {product.variants?.length ?? 0}
                  </li>
                </ul>
              ) : null}
              {tab === "reviews" && product ? (
                <ProductReviewsSection productId={product.id} orderItemId={orderItemId} />
              ) : null}
            </div>
          </Card>
        </div>

        <ShopSidebar newProducts={[]} className="hidden lg:block lg:max-w-[280px]" />
      </div>
    </div>
  )
}
