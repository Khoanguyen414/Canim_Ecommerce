import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Ban, CheckCircle, CreditCard, Loader2, Package, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { orderService } from "@/services/order.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd, toNumber } from "@/lib/format"
import {
  ORDER_STATUS_VI,
  PAYMENT_METHOD_VI,
  PAYMENT_STATUS_VI,
  PAYMENT_TX_STATUS_VI,
  isMerchantOnlinePayment,
  isPaymentPendingAdminConfirm,
  isPersonalQrPayment,
} from "@/lib/orderLabels"
import type { OrderDetailDto } from "@/types/api.types"
import { OrderTrackingPanel } from "@/components/orders/OrderTrackingPanel"
import { findProductIdByVariantId } from "@/lib/resolveProductId"

function statusBadgeClass(order: OrderDetailDto): string {
  if (order.orderStatus === "CANCELLED") return "bg-destructive/15 text-destructive"
  if (order.paymentStatus === "PAID") return "bg-emerald-100 text-emerald-800"
  if (order.paymentStatus === "PENDING_CONFIRMATION") return "bg-sky-100 text-sky-900"
  if (order.orderStatus === "PENDING") return "bg-amber-100 text-amber-900"
  return "bg-secondary text-secondary-foreground"
}

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const orderId = id ? Number(id) : NaN
  const paymentSuccessBanner = searchParams.get("payment") === "success"
  const paymentPendingBanner = searchParams.get("payment") === "pending"

  const [order, setOrder] = useState<OrderDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      setError("Mã đơn không hợp lệ")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await orderService.getMyOrder(orderId)
      if (!res.success || !res.result) throw new Error(res.message ?? "Không tải được đơn")
      setOrder(res.result)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const handleCancel = async () => {
    if (!order || !window.confirm("Hủy đơn hàng này?")) return
    setCancelling(true)
    try {
      const res = await orderService.cancelMyOrder(order.id)
      if (!res.success) throw new Error(res.message)
      setOrder(res.result ?? order)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  const needsOnlinePayment =
    order &&
    order.paymentStatus !== "PAID" &&
    isMerchantOnlinePayment(order.paymentMethod) &&
    order.orderStatus !== "CANCELLED"

  const awaitingQrConfirm =
    order &&
    isPaymentPendingAdminConfirm(order.paymentStatus) &&
    isPersonalQrPayment(order.paymentMethod) &&
    order.orderStatus !== "CANCELLED"

  const needsQrPayment =
    order &&
    order.paymentStatus === "UNPAID" &&
    isPersonalQrPayment(order.paymentMethod) &&
    order.orderStatus !== "CANCELLED"

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <p className="text-destructive">{error ?? "Không tìm thấy đơn"}</p>
        <Button className="mt-4" asChild>
          <Link to="/orders">Về danh sách đơn</Link>
        </Button>
      </div>
    )
  }

  const tx = order.latestPaymentTransaction

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link to="/orders" className="hover:underline">
              Đơn hàng
            </Link>
            {" / "}
            {order.orderNo}
          </p>
          <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <Badge className={statusBadgeClass(order)}>{ORDER_STATUS_VI[order.orderStatus]}</Badge>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {order.paymentStatus === "PAID" ? (
        <Card className="mb-6 border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-3 text-xl font-bold text-emerald-900">
            {paymentSuccessBanner ? "Thanh toán thành công" : "Đơn đã thanh toán"}
          </h2>
          <p className="mt-2 text-sm text-emerald-900/90">
            Cảm ơn bạn. Đơn <strong>{order.orderNo}</strong> đã được ghi nhận thanh toán (
            {formatVnd(toNumber(order.totalAmount))}). Shop sẽ xử lý đơn sớm.
          </p>
        </Card>
      ) : null}

      {awaitingQrConfirm ? (
        <Card className="mb-6 border-sky-200 bg-sky-50 p-6 text-center">
          <Package className="mx-auto h-10 w-10 text-sky-700" />
          <h2 className="mt-3 text-xl font-bold text-sky-950">
            {paymentPendingBanner ? "Đã gửi xác nhận chuyển khoản" : "Chờ shop xác nhận thanh toán"}
          </h2>
          <p className="mt-2 text-sm text-sky-900/90">
            Shop sẽ đối soát sao kê ngân hàng và xác nhận đơn <strong>{order.orderNo}</strong>. Bạn sẽ thấy trạng thái
            「Đã thanh toán」khi tiền đã được ghi nhận.
          </p>
        </Card>
      ) : null}

      {needsQrPayment ? (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-950">Chờ chuyển khoản QR</p>
          <p className="mt-1 text-sm text-amber-900/90">
            Quét mã VietQR, chuyển đúng số tiền và mã đơn {order.orderNo}.
          </p>
          <Button className="mt-3" asChild>
            <Link to={`/orders/${order.id}/qr-pay`}>
              <CreditCard className="mr-2 h-4 w-4" />
              Mở trang QR
            </Link>
          </Button>
        </Card>
      ) : needsOnlinePayment ? (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-950">Chờ thanh toán online</p>
          <p className="mt-1 text-sm text-amber-900/90">
            Đơn chưa được thanh toán qua {PAYMENT_METHOD_VI[order.paymentMethod]}. Hoàn tất thanh toán để shop xử lý
            đơn.
          </p>
          <Button className="mt-3" asChild>
            <Link to={`/orders/${order.id}/pay`}>
              <CreditCard className="mr-2 h-4 w-4" />
              Thanh toán ngay
            </Link>
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Sản phẩm</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-secondary">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.productNameSnapshot}</p>
                    <p className="text-muted-foreground">{item.skuSnapshot}</p>
                    <p>
                      {item.quantity} × {formatVnd(toNumber(item.price))}
                    </p>
                    {order.orderStatus === "DELIVERED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 gap-1"
                        type="button"
                        onClick={() => {
                          void findProductIdByVariantId(item.variantId).then((productId) => {
                            if (productId) {
                              navigate(`/products/${productId}?orderItemId=${item.id}`)
                            } else {
                              setError("Không tìm thấy sản phẩm để đánh giá.")
                            }
                          })
                        }}
                      >
                        <Star className="h-3 w-3" />
                        Đánh giá
                      </Button>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-medium">{formatVnd(toNumber(item.lineTotal))}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 font-semibold">Giao hàng</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Người nhận</dt>
                <dd>{order.receiverName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Điện thoại</dt>
                <dd>{order.receiverPhone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Địa chỉ</dt>
                <dd>{order.shippingAddress}</dd>
              </div>
              {order.orderNote ? (
                <div>
                  <dt className="text-muted-foreground">Ghi chú</dt>
                  <dd>{order.orderNote}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <OrderTrackingPanel order={order} />
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-6">
            <h2 className="font-semibold">Thanh toán</h2>
            <p className="text-sm">
              Phương thức: <strong>{PAYMENT_METHOD_VI[order.paymentMethod]}</strong>
            </p>
            <p className="text-sm">
              Trạng thái: <strong>{PAYMENT_STATUS_VI[order.paymentStatus] ?? order.paymentStatus}</strong>
            </p>
            {tx ? (
              <div className="rounded-lg bg-secondary/60 p-3 text-xs">
                <p>
                  Mã GD: <code>{tx.transactionCode}</code>
                </p>
                <p className="mt-1">
                  Giao dịch: {PAYMENT_TX_STATUS_VI[tx.status] ?? tx.status}
                </p>
              </div>
            ) : null}
            <div className="border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVnd(toNumber(order.subTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí ship</span>
                <span>{formatVnd(toNumber(order.shippingFee))}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold">
                <span>Tổng</span>
                <span className="text-primary">{formatVnd(toNumber(order.totalAmount))}</span>
              </div>
            </div>
          </Card>

          {order.canCancel ? (
            <Button
              variant="destructive"
              className="w-full gap-2"
              disabled={cancelling}
              onClick={() => void handleCancel()}
            >
              <Ban className="h-4 w-4" />
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
