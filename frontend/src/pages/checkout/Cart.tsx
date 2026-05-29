import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/common/EmptyState"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProductTracking } from "@/hooks/useProductTracking"
import { openLoginModalWithReturnTo } from "@/lib/authRedirect"
import { formatVnd } from "@/lib/format"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"

export default function Cart() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { lines, removeLine, setQuantity, subtotal, clear } = useCartStore()
  const { trackProductClick } = useProductTracking()

  const shipping = lines.length ? 30000 : 0
  const tax = Math.round(subtotal() * 0.08)
  const total = subtotal() + shipping + tax

  const handleCartProductClick = (item: {
    productId: number
    variantId?: number | null
  }) => {
    trackProductClick({
      productId: item.productId,
      variantId: item.variantId ?? null,
      source: "CART_ITEM",
    })
  }

  if (lines.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add items from the home page or product catalog."
          actionLabel="Continue shopping"
          onAction={() => navigate("/products")}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Shopping cart</h1>

        <Button
          variant="ghost"
          className="text-destructive"
          type="button"
          onClick={() => clear()}
        >
          Clear cart
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lines.map((item) => (
            <Card key={item.lineId} className="p-4">
              <div className="flex gap-4">
                <Link
                  to={`/products/${item.productId}`}
                  onClick={() => handleCartProductClick(item)}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${item.productId}`}
                    onClick={() => handleCartProductClick(item)}
                    className="font-semibold transition-colors hover:text-primary"
                  >
                    {item.productName}
                  </Link>

                  <p className="text-sm text-muted-foreground">
                    SKU: {item.sku}
                    {item.color ? ` · ${item.color}` : ""}
                    {item.size ? ` · ${item.size}` : ""}
                  </p>

                  <p className="mt-2 font-bold text-primary">
                    {formatVnd(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    type="button"
                    onClick={() => removeLine(item.lineId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Summary</h2>

            <div className="space-y-2 border-b border-border pb-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatVnd(subtotal())}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping (est.)</span>
                <span>{formatVnd(shipping)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax 8% (demo)</span>
                <span>{formatVnd(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatVnd(total)}</span>
            </div>

            <Button
              className="h-11 w-full"
              type="button"
              onClick={() => {
                if (!user) {
                  openLoginModalWithReturnTo("/checkout")
                  return
                }

                navigate("/checkout")
              }}
            >
              Proceed to checkout
            </Button>

            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => navigate("/products")}
            >
              Continue shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}