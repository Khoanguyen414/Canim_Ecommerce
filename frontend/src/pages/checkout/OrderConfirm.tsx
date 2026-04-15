import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useOrderStore } from "@/store/order.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingBag } from "lucide-react"

export default function OrderConfirm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = useOrderStore((s) => (id ? s.getById(id) : undefined))

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Không tìm thấy đơn hàng"
          description="Mã đơn không tồn tại trong bộ nhớ cục bộ của trình duyệt này."
          actionLabel="Về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    )
  }

  const created = new Date(order.createdAt)

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold">Đặt hàng thành công</h1>
          <p className="text-lg text-muted-foreground">Cảm ơn bạn. Đơn đã được lưu trong lịch sử đơn hàng (local).</p>
        </div>

        <Card className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn</p>
              <p className="text-lg font-bold">{order.orderCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt</p>
              <p className="text-lg font-bold">
                {created.toLocaleDateString("vi-VN")} {created.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="text-lg font-bold text-primary">{formatVnd(order.total)}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Package className="h-5 w-5" />
              Sản phẩm
            </h3>
            <ul className="space-y-2 text-sm">
              {order.items.map((i) => (
                <li key={i.lineId} className="flex justify-between gap-2">
                  <span className="line-clamp-2">
                    {i.productName} × {i.quantity}
                  </span>
                  <span className="shrink-0">{formatVnd(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
          <Button variant="outline" asChild>
            <Link to="/orders">
              Xem lịch sử đơn
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
