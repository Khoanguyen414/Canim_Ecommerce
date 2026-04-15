import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/order.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function OrderHistory() {
  const navigate = useNavigate()
  const orders = useOrderStore((s) => s.orders)

  if (!orders.length) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Chưa có đơn hàng"
          description="Khi bạn hoàn tất thanh toán, đơn sẽ xuất hiện tại đây (lưu trên trình duyệt)."
          actionLabel="Mua sắm ngay"
          onAction={() => navigate("/products")}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-2 text-3xl font-bold">Lịch sử đơn hàng</h1>
      <p className="mb-8 text-sm text-muted-foreground">Dữ liệu cục bộ — sẵn sàng thay bằng REST `/orders` khi backend hỗ trợ.</p>

      <div className="space-y-4">
        {orders.map((o) => {
          const d = new Date(o.createdAt)
          return (
            <Card key={o.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{d.toLocaleString("vi-VN")}</p>
                <p className="text-lg font-semibold">{o.orderCode}</p>
                <p className="text-sm text-muted-foreground">{o.items.length} mặt hàng · {o.status}</p>
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
