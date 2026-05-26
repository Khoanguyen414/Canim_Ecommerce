import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/order.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { OrderStatus } from "@/store/order.store"

const STATUS_VI: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

export default function OrderHistory() {
  const navigate = useNavigate()
  const orders = useOrderStore((s) => s.orders)

  if (!orders.length) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Chưa có đơn hàng"
          description="Bạn chưa có đơn nào. Hãy khám phá cửa hàng và thêm sản phẩm vào giỏ nhé."
          actionLabel="Mua sắm ngay"
          onAction={() => navigate("/products")}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-2 text-3xl font-bold">Lịch sử đơn hàng</h1>
      <p className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Dữ liệu đơn được lưu <strong>cục bộ trên trình duyệt</strong> (chưa đồng bộ server — backend chưa có API đơn hàng).
      </p>
      <p className="mb-8 text-sm text-muted-foreground">
        Các đơn đặt gần đây; mở chi tiết để xem lại sản phẩm và tổng tiền.
      </p>

      <div className="space-y-4">
        {orders.map((o) => {
          const d = new Date(o.createdAt)
          return (
            <Card key={o.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{d.toLocaleString("vi-VN")}</p>
                <p className="text-lg font-semibold">{o.orderCode}</p>
                <p className="text-sm text-muted-foreground">
                  {o.items.length} mặt hàng · {STATUS_VI[o.status] ?? o.status}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-xl font-bold text-primary">{formatVnd(o.total)}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${o.id}/confirm`}>Chi tiết</Link>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
