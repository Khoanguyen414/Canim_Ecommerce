import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { orderService } from "@/services/order.service"
import { paymentService } from "@/services/payment.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd, toNumber } from "@/lib/format"
import { PAYMENT_METHOD_VI } from "@/lib/orderLabels"
import type { OrderDetailDto, PaymentMethod } from "@/types/api.types"

export default function OrderPaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = id ? Number(id) : NaN

  const [order, setOrder] = useState<OrderDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoTried, setAutoTried] = useState(false)

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
        if (!res.success || !res.result) throw new Error(res.message)
        setOrder(res.result)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId])

  const startPayment = async (method: PaymentMethod) => {
    if (!Number.isFinite(orderId)) return
    setPaying(true)
    setError(null)
    try {
      const res = await paymentService.createPayment(orderId, { paymentMethod: method })
      if (!res.success || !res.result?.paymentUrl) {
        throw new Error(res.message || "Không tạo được link thanh toán")
      }
      window.location.href = res.result.paymentUrl
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPaying(false)
    }
  }

  useEffect(() => {
    if (!order || autoTried || order.paymentStatus === "PAID") return
    const method = order.paymentMethod
    if (method === "VNPAY" || method === "MOMO") {
      setAutoTried(true)
      void startPayment(method)
    }
  }, [order, autoTried])

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

  if (order.paymentStatus === "PAID") {
    navigate(`/orders/${order.id}/confirm`, { replace: true })
    return null
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
          <p className="text-muted-foreground">
            {order.orderNo} · {formatVnd(toNumber(order.totalAmount))}
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
            <p className="mt-2 text-xs">
              Kiểm tra cấu hình VNPAY/MOMO trên server (<code>VNPAY_TMN_CODE</code>,{" "}
              <code>MOMO_PARTNER_CODE</code>, ...).
            </p>
          </div>
        ) : paying ? (
          <Card className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang chuyển sang cổng {PAYMENT_METHOD_VI[order.paymentMethod]}...
          </Card>
        ) : null}

        <div className="space-y-2">
          {order.paymentMethod === "VNPAY" ? (
            <Button className="w-full" disabled={paying} onClick={() => void startPayment("VNPAY")}>
              Thanh toán VNPay
            </Button>
          ) : null}
          {order.paymentMethod === "MOMO" ? (
            <Button className="w-full" disabled={paying} onClick={() => void startPayment("MOMO")}>
              Thanh toán MoMo
            </Button>
          ) : null}
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/orders/${order.id}`}>Quay lại chi tiết đơn</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
