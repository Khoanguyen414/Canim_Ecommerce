import { Link, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import { formatVnd } from "@/lib/format"
import { useWishlistStore } from "@/store/wishlist.store"
import { useCartStore } from "@/store/cart.store"
import { productService } from "@/services/product.service"
import { getDefaultVariant } from "@/lib/product"
import { requiresVariantSelection } from "@/lib/productVariantSelection"
import { toNumber } from "@/lib/format"

export default function FavoritesPage() {
  const navigate = useNavigate()
  const items = useWishlistStore((s) => s.items)
  const remove = useWishlistStore((s) => s.remove)
  const addLine = useCartStore((s) => s.addLine)

  const handleAddToCart = async (productId: number) => {
    try {
      const { data } = await productService.getPublicById(productId)
      if (!data.success || !data.result) return
      const p = data.result
      if (requiresVariantSelection(p.variants ?? [])) {
        navigate(`/products/${p.id}`)
        return
      }
      const variant = getDefaultVariant(p)
      if (!variant) return
      addLine({
        productId: p.id,
        variantId: variant.id,
        productName: p.name,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        price: toNumber(variant.price),
        quantity: 1,
        imageUrl: items.find((i) => i.productId === productId)?.imageUrl,
      })
    } catch {
      /* ignore */
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="mb-6 text-2xl font-bold text-[#253d4e]">Sản phẩm yêu thích</h1>
        <EmptyState
          icon={Heart}
          title="Chưa có sản phẩm yêu thích"
          description="Nhấn biểu tượng trái tim trên sản phẩm để lưu vào danh sách này."
          actionLabel="Khám phá cửa hàng"
          onAction={() => {
            window.location.href = "/products"
          }}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-7 w-7 fill-primary text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-[#253d4e]">Sản phẩm yêu thích</h1>
          <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <Link
              to={`/products/${item.productId}`}
              className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                to={`/products/${item.productId}`}
                className="line-clamp-2 font-medium text-[#253d4e] hover:text-primary"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm font-bold text-primary">{formatVnd(item.price)}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1 bg-primary text-xs"
                  onClick={() => void handleAddToCart(item.productId)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Thêm giỏ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-xs"
                  onClick={() => remove(item.productId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Bỏ
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
