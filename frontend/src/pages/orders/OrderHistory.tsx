import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingBag } from "lucide-react"
import { orderService } from "@/services/order.service"
import { formatVnd, toNumber } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { getApiErrorMessage } from "@/lib/apiError"
import {
  ORDER_STATUS_VI,
  PAYMENT_METHOD_VI,
  PAYMENT_STATUS_VI,
  isMerchantOnlinePayment,
  isPaymentPendingAdminConfirm,
  isPersonalQrPayment,
} from "@/lib/orderLabels"
import type { OrderSummaryDto } from "@/types/api.types"

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await orderService.getMyOrders(page, 20)
        if (!res.success || !res.result) throw new Error(res.message ?? "Không tải được danh sách đơn")
        setOrders(res.result.data ?? [])
        setTotalPages(res.result.totalPages ?? 1)
      } catch (err) {
        setError(getApiErrorMessage(err))
        setOrders([])
      } finally {
        setLoading(false)
      }
    })()
  }, [page])

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="container py-16">
        {error ? (
          <p className="mb-4 text-center text-sm text-destructive">{error}</p>
        ) : null}
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
      <p className="mb-8 text-sm text-muted-foreground">
        Đơn hàng được lưu trên tài khoản của bạn. Thanh toán bằng chuyển khoản QR hoặc COD khi nhận hàng.
      </p>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {orders.map((o) => {
          const d = o.createdAt ? new Date(o.createdAt) : new Date()
          const unpaidOnline =
            o.paymentStatus !== "PAID" &&
            isMerchantOnlinePayment(o.paymentMethod) &&
            o.orderStatus !== "CANCELLED"
          const pendingQrConfirm =
            isPaymentPendingAdminConfirm(o.paymentStatus) &&
            isPersonalQrPayment(o.paymentMethod) &&
            o.orderStatus !== "CANCELLED"
          const unpaidQr =
            o.paymentStatus === "UNPAID" && isPersonalQrPayment(o.paymentMethod) && o.orderStatus !== "CANCELLED"

          return (
            <Card key={o.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{d.toLocaleString("vi-VN")}</p>
                <p className="text-lg font-semibold">{o.orderNo}</p>
                <p className="text-sm text-muted-foreground">
                  {PAYMENT_METHOD_VI[o.paymentMethod]} · {ORDER_STATUS_VI[o.orderStatus]} ·{" "}
                  {PAYMENT_STATUS_VI[o.paymentStatus] ?? o.paymentStatus}
                </p>
                {pendingQrConfirm ? (
                  <p className="mt-1 text-xs font-medium text-sky-700">Chờ shop xác nhận CK</p>
                ) : unpaidQr ? (
                  <p className="mt-1 text-xs font-medium text-amber-700">Chờ chuyển QR</p>
                ) : unpaidOnline ? (
                  <p className="mt-1 text-xs font-medium text-amber-700">Chờ thanh toán online</p>
                ) : null}
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-xl font-bold text-primary">{formatVnd(toNumber(o.totalAmount))}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/orders/${o.id}`}>Chi tiết</Link>
                  </Button>
                  {pendingQrConfirm ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/orders/${o.id}`}>Theo dõi</Link>
                    </Button>
                  ) : unpaidQr ? (
                    <Button size="sm" asChild>
                      <Link to={`/orders/${o.id}/qr-pay`}>Quét QR</Link>
                    </Button>
                  ) : unpaidOnline ? (
                    <Button size="sm" asChild>
                      <Link to={`/orders/${o.id}/pay`}>Thanh toán</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}
