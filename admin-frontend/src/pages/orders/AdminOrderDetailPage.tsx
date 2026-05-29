import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { orderService } from "@/services/order.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd, toNumber } from "@/lib/format"
import {
  ORDER_STATUS_VI,
  PAYMENT_METHOD_VI,
  PAYMENT_STATUS_VI,
  isPersonalQrPayment,
  orderBadgeVariant,
  paymentBadgeVariant,
  type OrderStatus,
} from "@/lib/orderLabels"
import type { OrderDetailRecord } from "@/types/api"
import { AdminOrderTrackingPanel } from "@/components/orders/AdminOrderTrackingPanel"

const NEXT_STATUSES: OrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED"]

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = id ? Number(id) : NaN

  const [order, setOrder] = useState<OrderDetailRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      setError("Mã đơn không hợp lệ")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getOrder(orderId)
      if (!data.success || !data.result) throw new Error(data.message ?? "Không tải được đơn")
      setOrder(data.result)
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

  const canConfirmQr =
    order &&
    isPersonalQrPayment(order.paymentMethod) &&
    order.paymentStatus === "PENDING_CONFIRMATION" &&
    order.orderStatus !== "CANCELLED"

  const handleConfirmQr = async () => {
    if (!order || !window.confirm(`Xác nhận đã nhận ${formatVnd(order.totalAmount)} cho đơn ${order.orderNo}?`)) {
      return
    }
    setActing(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await orderService.confirmQrPayment(order.id)
      if (!data.success) throw new Error(data.message)
      setOrder(data.result ?? order)
      setSuccess("Đã xác nhận thanh toán — đơn chuyển sang「Đã thanh toán」")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActing(false)
    }
  }

  const handleRejectQr = async () => {
    if (
      !order ||
      !window.confirm(
        `Từ chối khai báo chuyển khoản đơn ${order.orderNo}? Khách sẽ cần chuyển lại và gửi xác nhận mới.`,
      )
    ) {
      return
    }
    setActing(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await orderService.rejectQrPayment(order.id)
      if (!data.success) throw new Error(data.message)
      setOrder(data.result ?? order)
      setSuccess("Đã từ chối — trạng thái thanh toán về「Chưa thanh toán」")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActing(false)
    }
  }

  const handleStatus = async (orderStatus: OrderStatus) => {
    if (!order) return
    setActing(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await orderService.updateStatus(order.id, orderStatus)
      if (!data.success) throw new Error(data.message)
      setOrder(data.result ?? order)
      setSuccess(`Đã cập nhật trạng thái: ${ORDER_STATUS_VI[orderStatus]}`)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Alert variant="error">{error ?? "Không tìm thấy đơn"}</Alert>
        <button type="button" className="btn btn-outline-secondary mt-3" onClick={() => navigate("/orders")}>
          Về danh sách
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/orders" className="btn btn-sm btn-link text-decoration-none px-0">
          <ArrowLeft size={16} className="me-1" />
          Danh sách đơn
        </Link>
      </div>

      <PageHeader
        title={order.orderNo}
        description={`Khách: ${order.receiverName} · ${order.receiverPhone}`}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      {canConfirmQr ? (
        <div className="card mb-4 border-warning p-4" style={{ borderWidth: 2 }}>
          <h2 className="h5 mb-2">Đối soát chuyển khoản QR</h2>
          <p className="text-muted mb-3">
            Khách đã khai báo đã chuyển <strong>{formatVnd(order.totalAmount)}</strong>. Kiểm tra sao kê ngân hàng
            (nội dung CK thường là mã đơn <strong>{order.orderNo}</strong>), rồi xác nhận hoặc từ chối.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-success" disabled={acting} onClick={() => void handleConfirmQr()}>
              <CheckCircle size={16} className="me-1" />
              {acting ? "Đang xử lý..." : "Đã nhận tiền — xác nhận"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={acting}
              onClick={() => void handleRejectQr()}
            >
              <XCircle size={16} className="me-1" />
              Chưa thấy tiền — từ chối
            </button>
          </div>
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card p-4 mb-4">
            <h2 className="h6 text-muted mb-3">Sản phẩm</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="fw-medium">{item.productNameSnapshot}</div>
                        <div className="small text-muted">{item.skuSnapshot}</div>
                      </td>
                      <td>{item.quantity}</td>
                      <td className="text-end">{formatVnd(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="row mt-3 mb-0 small">
              <dt className="col-6 text-muted">Tạm tính</dt>
              <dd className="col-6 text-end">{formatVnd(order.subTotal)}</dd>
              <dt className="col-6 text-muted">Phí ship</dt>
              <dd className="col-6 text-end">{formatVnd(order.shippingFee)}</dd>
              <dt className="col-6 fw-semibold">Tổng</dt>
              <dd className="col-6 text-end fw-bold text-primary">{formatVnd(order.totalAmount)}</dd>
            </dl>
          </div>

          {order.orderNote ? (
            <div className="card p-4">
              <h2 className="h6 text-muted mb-2">Ghi chú / lịch sử thanh toán</h2>
              <p className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {order.orderNote.split(" | ").join("\n")}
              </p>
            </div>
          ) : null}

          <AdminOrderTrackingPanel orderId={order.id} />
        </div>

        <div className="col-lg-4">
          <div className="card p-4 mb-4">
            <h2 className="h6 text-muted mb-3">Thanh toán</h2>
            <p className="mb-2">{PAYMENT_METHOD_VI[order.paymentMethod]}</p>
            <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
              {PAYMENT_STATUS_VI[order.paymentStatus]}
            </Badge>
          </div>

          <div className="card p-4 mb-4">
            <h2 className="h6 text-muted mb-3">Trạng thái đơn</h2>
            <Badge variant={orderBadgeVariant(order.orderStatus)}>{ORDER_STATUS_VI[order.orderStatus]}</Badge>
            {order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED" ? (
              <div className="mt-3 d-flex flex-column gap-2">
                {NEXT_STATUSES.filter((s) => s !== order.orderStatus).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    disabled={acting}
                    onClick={() => void handleStatus(s)}
                  >
                    → {ORDER_STATUS_VI[s]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="card p-4">
            <h2 className="h6 text-muted mb-3">Giao hàng</h2>
            <p className="small mb-1">{order.receiverName}</p>
            <p className="small mb-1">{order.receiverPhone}</p>
            <p className="small text-muted mb-0">{order.shippingAddress}</p>
            <p className="small text-muted mt-2 mb-0">
              User ID: {order.userId}
              <br />
              Tạo lúc: {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
