import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MapPin, CreditCard, Truck } from "lucide-react"
import { useCartStore } from "@/store/cart.store"
import { useOrderStore } from "@/store/order.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingCart } from "lucide-react"

export default function Checkout() {
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCartStore()
  const addOrder = useOrderStore((s) => s.addOrder)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "cod",
  })
  const [shippingId, setShippingId] = useState("standard")
  const [submitting, setSubmitting] = useState(false)

  const shippingOptions = useMemo(
    () => [
      { id: "fast", name: "Giao hàng nhanh (1–2 ngày)", price: 50000 },
      { id: "standard", name: "Giao hàng tiêu chuẩn (3–5 ngày)", price: 30000 },
      { id: "economy", name: "Giao hàng tiết kiệm (5–7 ngày)", price: 15000 },
    ],
    [],
  )

  const shippingFee = shippingOptions.find((s) => s.id === shippingId)?.price ?? 30000
  const tax = Math.round(subtotal() * 0.08)
  const total = subtotal() + shippingFee + tax

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    if (!lines.length) return
    setSubmitting(true)
    try {
      const id = crypto.randomUUID()
      const orderCode = `DH-${Date.now()}`
      const deliverySummary = [formData.fullName, formData.phone, formData.address, formData.ward, formData.district, formData.city]
        .filter(Boolean)
        .join(", ")

      addOrder({
        id,
        orderCode,
        items: lines.map((l) => ({ ...l })),
        subtotal: subtotal(),
        shipping: shippingFee,
        tax,
        total,
        deliverySummary,
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
        status: "confirmed",
      })
      clear()
      navigate(`/orders/${id}/confirm`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!lines.length) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Giỏ hàng trống"
          description="Không thể thanh toán khi chưa có sản phẩm."
          actionLabel="Xem sản phẩm"
          onAction={() => navigate("/products")}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input placeholder="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <Input placeholder="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <Input placeholder="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} required />
              <Input placeholder="Địa chỉ đầy đủ" name="address" value={formData.address} onChange={handleChange} required />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input placeholder="Tỉnh / Thành phố" name="city" value={formData.city} onChange={handleChange} />
                <Input placeholder="Quận / Huyện" name="district" value={formData.district} onChange={handleChange} />
                <Input placeholder="Phường / Xã" name="ward" value={formData.ward} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" />
                Vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shippingOptions.map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === method.id}
                    onChange={() => setShippingId(method.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{formatVnd(method.price)}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "cod", name: "Thanh toán khi nhận hàng (COD)" },
                { id: "bank", name: "Chuyển khoản ngân hàng" },
                { id: "card", name: "Thẻ (demo)" },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                  />
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 space-y-4 p-6">
            <h2 className="text-xl font-bold">Đơn hàng</h2>
            <div className="max-h-56 space-y-2 overflow-y-auto text-sm">
              {lines.map((l) => (
                <div key={l.lineId} className="flex justify-between gap-2">
                  <span className="line-clamp-2">
                    {l.productName} × {l.quantity}
                  </span>
                  <span className="shrink-0">{formatVnd(l.price * l.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế (demo)</span>
                <span>{formatVnd(tax)}</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
              <span>Tổng</span>
              <span className="text-primary">{formatVnd(total)}</span>
            </div>
            <Button className="h-11 w-full" type="button" disabled={submitting} onClick={handlePlaceOrder}>
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Đơn hàng lưu cục bộ trên trình duyệt — khi backend có REST đơn hàng, thay bằng gọi API tại đây.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
