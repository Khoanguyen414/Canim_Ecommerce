import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { paymentService } from "@/services/payment.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { PAYMENT_STATUS_VI, PAYMENT_TX_STATUS_VI } from "@/lib/orderLabels"
import type { PaymentCallbackResult } from "@/types/api.types"

type Gateway = "vnpay" | "momo"

type Props = {
  gateway: Gateway
}

export default function PaymentReturnPage({ gateway }: Props) {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PaymentCallbackResult | null>(null)

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const res =
          gateway === "vnpay"
            ? await paymentService.confirmVnpayReturn(queryParams)
            : await paymentService.confirmMomoReturn(queryParams)
        if (!res.success || !res.result) throw new Error(res.message || "Xác nhận thanh toán thất bại")
        if (!cancelled) setResult(res.result)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gateway, queryParams])

  const success = result?.transactionStatus === "PAID" && result.orderPaymentStatus === "PAID"
  const gatewayLabel = gateway === "vnpay" ? "VNPay" : "MoMo"

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg space-y-6">
        {loading ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang xác nhận thanh toán {gatewayLabel} với máy chủ...</p>
          </Card>
        ) : error ? (
          <Card className="space-y-4 p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-xl font-bold">Không xác nhận được thanh toán</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <Link to="/orders">Về lịch sử đơn</Link>
            </Button>
          </Card>
        ) : result ? (
          <Card className="space-y-5 p-8 text-center">
            {success ? (
              <CheckCircle className="mx-auto h-14 w-14 text-emerald-600" />
            ) : (
              <XCircle className="mx-auto h-14 w-14 text-destructive" />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {success ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất"}
              </h1>
              <p className="mt-2 text-muted-foreground">{result.message}</p>
            </div>
            <dl className="space-y-2 rounded-lg bg-secondary/60 p-4 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Mã giao dịch</dt>
                <dd className="font-mono text-xs">{result.transactionCode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trạng thái giao dịch</dt>
                <dd>{PAYMENT_TX_STATUS_VI[result.transactionStatus] ?? result.transactionStatus}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trạng thái đơn</dt>
                <dd>{PAYMENT_STATUS_VI[result.orderPaymentStatus] ?? result.orderPaymentStatus}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={`/orders/${result.orderId}${success ? "?payment=success" : ""}`}>Xem đơn hàng</Link>
              </Button>
              {!success && result.orderId ? (
                <Button variant="outline" asChild>
                  <Link to={`/orders/${result.orderId}/pay`}>Thử thanh toán lại</Link>
                </Button>
              ) : null}
              <Button variant="ghost" asChild>
                <Link to="/">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
