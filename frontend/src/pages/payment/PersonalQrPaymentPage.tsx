import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Copy, Loader2, QrCode, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { orderService } from "@/services/order.service"
import { paymentQrConfig } from "@/config/payment-qr.config"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd, toNumber } from "@/lib/format"
import { buildVietQrImageUrl } from "@/lib/vietQr"
import { isPersonalQrPayment, PAYMENT_METHOD_VI } from "@/lib/orderLabels"
import type { OrderDetailDto, OrderDynamicQrDto } from "@/types/api.types"

export default function PersonalQrPaymentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderId = id ? Number(id) : NaN

  const [order, setOrder] = useState<OrderDetailDto | null>(null)
  const [dynamicQr, setDynamicQr] = useState<OrderDynamicQrDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [declaring, setDeclaring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyHint, setCopyHint] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      setError("Mã đơn không hợp lệ")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const orderRes = await orderService.getMyOrder(orderId)
      if (!orderRes.success || !orderRes.result) throw new Error(orderRes.message ?? "Không tải được đơn")
      const o = orderRes.result
      if (!isPersonalQrPayment(o.paymentMethod)) {
        throw new Error("Đơn này không dùng chuyển khoản QR")
      }
      setOrder(o)

      if (o.paymentStatus === "PAID") {
        navigate(`/orders/${orderId}?payment=success`, { replace: true })
        return
      }
      if (o.paymentStatus === "PENDING_CONFIRMATION") {
        navigate(`/orders/${orderId}?payment=pending`, { replace: true })
        return
      }

      try {
        const qrRes = await orderService.getDynamicQr(orderId)
        if (qrRes.success && qrRes.result) {
          setDynamicQr(qrRes.result)
        }
      } catch {
        setDynamicQr(null)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [orderId, navigate])

  useEffect(() => {
    void load()
  }, [load])

  const payAmount = useMemo(() => {
    if (!order) return 0
    const fromApi = dynamicQr ? toNumber(dynamicQr.amount) : 0
    const fromOrder = toNumber(order.totalAmount)
    return Math.max(fromApi, fromOrder)
  }, [order, dynamicQr])

  const transferNote = dynamicQr?.transferContent?.trim() || order?.orderNo || String(orderId)

  const bankQrImageUrl = useMemo(() => {
    if (!order || payAmount <= 0) return null
    if (dynamicQr?.dynamicQrImageUrl) return dynamicQr.dynamicQrImageUrl
    const stk = paymentQrConfig.vnpay.accountNumber.trim()
    if (!stk) return null
    return buildVietQrImageUrl({
      acquirerId: paymentQrConfig.vnpay.vietqrAcquirerId,
      accountNumber: stk,
      amountVnd: payAmount,
      transferContent: transferNote,
      accountName: paymentQrConfig.vnpay.accountName,
    })
  }, [order, dynamicQr?.dynamicQrImageUrl, payAmount, transferNote])

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyHint(`Đã copy ${label}`)
      setTimeout(() => setCopyHint(null), 2000)
    } catch {
      setCopyHint("Không copy được — hãy chọn và copy thủ công")
    }
  }

  const handleDeclare = async () => {
    if (!Number.isFinite(orderId)) return
    setDeclaring(true)
    setError(null)
    try {
      const res = await orderService.declareQrTransfer(orderId)
      if (!res.success) throw new Error(res.message)
      navigate(`/orders/${orderId}?payment=pending`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeclaring(false)
    }
  }

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

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <QrCode className="mx-auto mb-2 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Chuyển khoản QR</h1>
          <p className="text-muted-foreground">
            {order.orderNo} · {PAYMENT_METHOD_VI[order.paymentMethod]}
          </p>
        </div>

        <Card className="rounded-xl border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">Số tiền cần thanh toán</p>
          <p className="text-3xl font-bold text-primary">{formatVnd(payAmount)}</p>
          <p className="mt-2 text-sm">
            Nội dung chuyển khoản: <strong className="text-foreground">{transferNote}</strong>
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => void copyText(transferNote, "mã đơn")}
          >
            <Copy className="mr-1 h-3 w-3" />
            Sao chép mã đơn
          </Button>
          {copyHint ? <p className="mt-2 text-xs text-muted-foreground">{copyHint}</p> : null}
        </Card>

        {bankQrImageUrl ? (
          <p className="text-center text-sm text-muted-foreground">
            Mã QR đã gắn sẵn <strong>{formatVnd(payAmount)}</strong> và mã đơn — quét bằng app ngân hàng.
          </p>
        ) : (
          <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-medium">Chưa tạo được mã QR</p>
            <p className="mt-1">
              Cấu hình STK ngân hàng trong <code>payment-qr.config.ts</code> (mục vnpay.accountNumber).
            </p>
          </Card>
        )}

        <Card className="space-y-4 p-6">
          <div className="flex flex-col items-center gap-3">
            {bankQrImageUrl ? (
              <img
                src={bankQrImageUrl}
                alt="QR chuyển khoản"
                className="h-64 w-64 rounded-lg border border-border bg-white object-contain p-2 shadow-sm"
              />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
                Chưa cấu hình STK ngân hàng
              </div>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Tải lại
            </Button>
          </div>

          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-muted-foreground">Người nhận</dt>
              <dd className="font-medium">
                {dynamicQr?.accountName ?? paymentQrConfig.vnpay.accountName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ngân hàng / STK</dt>
              <dd>
                {dynamicQr?.bankName ?? paymentQrConfig.vnpay.bankName} ·{" "}
                {(dynamicQr?.accountNumber ?? paymentQrConfig.vnpay.accountNumber) || "—"}
              </dd>
            </div>
          </dl>

          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Mở app ngân hàng.</li>
            <li>Chọn Quét mã QR.</li>
            <li>Kiểm tra số tiền và nội dung chuyển khoản.</li>
            <li>Xác nhận, rồi bấm nút bên dưới.</li>
          </ol>
        </Card>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button className="w-full" disabled={declaring || !bankQrImageUrl} onClick={() => void handleDeclare()}>
          {declaring ? "Đang gửi..." : "Tôi đã chuyển khoản — gửi xác nhận"}
        </Button>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to={`/orders/${order.id}`}>Chi tiết đơn</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/orders">Lịch sử đơn</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
