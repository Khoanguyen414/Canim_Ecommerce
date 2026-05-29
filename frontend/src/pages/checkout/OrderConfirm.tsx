import { useEffect, useState } from "react"
import { CheckCircle, Package, ArrowRight, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link, useNavigate, useParams } from "react-router-dom"
import { orderService } from "@/services/order.service"
import { formatVnd, toNumber } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingBag } from "lucide-react"
import { getApiErrorMessage } from "@/lib/apiError"
import {
  ORDER_STATUS_VI,
  PAYMENT_METHOD_VI,
  PAYMENT_STATUS_VI,
  isPersonalQrPayment,
} from "@/lib/orderLabels"
import type { OrderDetailDto } from "@/types/api.types"

export default function OrderConfirm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = id ? Number(id) : NaN

  const [order, setOrder] = useState<OrderDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      setError("Mã đơn không hợp lệ")
      setLoading(false)
      return
    }
    void (async () => {
      setLoading(true)
      try {
        const res = await orderService.getMyOrder(orderId)
        if (!res.success || !res.result) throw new Error(res.message ?? "Không tải được đơn")
        setOrder(res.result)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId])

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Không tìm thấy đơn hàng"
          description={error ?? "Đơn không tồn tại hoặc bạn không có quyền xem."}
          actionLabel="Về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    )
  }

  const created = order.createdAt ? new Date(order.createdAt) : new Date()
  const isCancelled = order.orderStatus === "CANCELLED"
  const needsQrPayment =
    order.paymentStatus === "UNPAID" && isPersonalQrPayment(order.paymentMethod)

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold">
            {isCancelled
              ? "Đơn đã hủy"
              : needsQrPayment
                ? "Đặt hàng thành công — chuyển khoản QR"
                : "Đặt hàng thành công"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {needsQrPayment
              ? "Quét mã VietQR và chuyển khoản đúng số tiền + mã đơn. Sau đó bấm「Tôi đã chuyển khoản — gửi xác nhận」— shop sẽ đối soát và xác nhận."
              : "Cảm ơn bạn. Shop sẽ xử lý đơn trong thời gian sớm nhất."}
          </p>
        </div>

        {needsQrPayment ? (
          <Card className="border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-950">Quét mã VietQR và chuyển đúng số tiền + mã đơn.</p>
            <Button className="mt-3 gap-2" asChild>
              <Link to={`/orders/${order.id}/qr-pay`}>
                <CreditCard className="h-4 w-4" />
                Mở trang QR thanh toán
              </Link>
            </Button>
          </Card>
        ) : null}

        <Card className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn</p>
              <p className="text-lg font-bold">{order.orderNo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt</p>
              <p className="text-lg font-bold">
                {created.toLocaleDateString("vi-VN")}{" "}
                {created.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="text-lg font-bold text-primary">{formatVnd(toNumber(order.totalAmount))}</p>
            </div>
          </div>

          <dl className="grid gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Trạng thái</dt>
              <dd>{ORDER_STATUS_VI[order.orderStatus]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Thanh toán</dt>
              <dd>
                {PAYMENT_METHOD_VI[order.paymentMethod]} ·{" "}
                {PAYMENT_STATUS_VI[order.paymentStatus] ?? order.paymentStatus}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Người nhận</dt>
              <dd className="mt-1">
                {order.receiverName} · {order.receiverPhone}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Địa chỉ</dt>
              <dd className="mt-1">{order.shippingAddress}</dd>
            </div>
          </dl>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Package className="h-5 w-5" />
              Sản phẩm
            </h3>
            <ul className="space-y-2 text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="line-clamp-2">
                    {i.productNameSnapshot} × {i.quantity}
                  </span>
                  <span className="shrink-0">{formatVnd(toNumber(i.lineTotal))}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
          <Button variant="outline" asChild>
            <Link to={`/orders/${order.id}`}>
              Chi tiết đơn
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/orders">Lịch sử đơn</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
