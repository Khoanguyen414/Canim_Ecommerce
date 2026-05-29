import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Eye } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { orderService } from "@/services/order.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { formatVnd } from "@/lib/format"
import {
  ORDER_STATUS_VI,
  PAYMENT_METHOD_VI,
  PAYMENT_STATUS_VI,
  isPersonalQrPayment,
  orderBadgeVariant,
  paymentBadgeVariant,
  type PaymentStatus,
} from "@/lib/orderLabels"
import type { OrderSummaryRecord } from "@/types/api"

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPayment = (searchParams.get("paymentStatus") as PaymentStatus | null) ?? ""

  const [rows, setRows] = useState<OrderSummaryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [keywords, setKeywords] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">(initialPayment)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getOrders({
        pageNum: page,
        sizePage: 20,
        keywords: keywords.trim() || undefined,
        paymentStatus: paymentFilter || undefined,
      })
      if (!data.success) throw new Error(data.message ?? "Không tải được đơn")
      const pageData = data.result
      setRows(pageData?.data ?? pageData?.content ?? [])
      setTotalPages(pageData?.totalPages ?? 1)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, keywords, paymentFilter])

  useEffect(() => {
    void load()
  }, [load])

  const applyPaymentFilter = (status: PaymentStatus | "") => {
    setPaymentFilter(status)
    setPage(1)
    if (status) {
      setSearchParams({ paymentStatus: status })
    } else {
      setSearchParams({})
    }
  }

  const columns: Column<OrderSummaryRecord>[] = [
    {
      key: "orderNo",
      header: "Mã đơn",
      render: (o) => (
        <div>
          <div className="fw-semibold">{o.orderNo}</div>
          <div className="text-muted small">#{o.id}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Khách",
      render: (o) => (
        <div className="small">
          <div>{o.receiverName}</div>
          <div className="text-muted">{o.receiverPhone}</div>
        </div>
      ),
    },
    {
      key: "payment",
      header: "Thanh toán",
      render: (o) => (
        <div className="d-flex flex-column gap-1 align-items-start">
          <span className="small text-muted">{PAYMENT_METHOD_VI[o.paymentMethod]}</span>
          <Badge variant={paymentBadgeVariant(o.paymentStatus)}>
            {PAYMENT_STATUS_VI[o.paymentStatus]}
          </Badge>
        </div>
      ),
    },
    {
      key: "orderStatus",
      header: "Đơn hàng",
      render: (o) => <Badge variant={orderBadgeVariant(o.orderStatus)}>{ORDER_STATUS_VI[o.orderStatus]}</Badge>,
    },
    {
      key: "total",
      header: "Tổng",
      align: "right",
      render: (o) => <strong>{formatVnd(o.totalAmount)}</strong>,
    },
    {
      key: "created",
      header: "Ngày tạo",
      render: (o) =>
        o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : "—",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (o) => (
        <Link className="btn btn-sm btn-outline-primary" to={`/orders/${o.id}`}>
          <Eye size={14} className="me-1" />
          Chi tiết
        </Link>
      ),
    },
  ]

  const pendingCount = rows.filter(
    (o) => o.paymentStatus === "PENDING_CONFIRMATION" && isPersonalQrPayment(o.paymentMethod),
  ).length

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        description="Đối soát thanh toán chuyển khoản QR và xử lý đơn"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="card mb-3 p-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className={`btn btn-sm ${paymentFilter === "PENDING_CONFIRMATION" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() =>
              applyPaymentFilter(paymentFilter === "PENDING_CONFIRMATION" ? "" : "PENDING_CONFIRMATION")
            }
          >
            Chờ xác nhận CK
            {paymentFilter === "PENDING_CONFIRMATION" && pendingCount > 0 ? ` (${pendingCount})` : null}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${paymentFilter === "UNPAID" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => applyPaymentFilter(paymentFilter === "UNPAID" ? "" : "UNPAID")}
          >
            Chưa thanh toán
          </button>
          <button
            type="button"
            className={`btn btn-sm ${paymentFilter === "PAID" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => applyPaymentFilter(paymentFilter === "PAID" ? "" : "PAID")}
          >
            Đã thanh toán
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => applyPaymentFilter("")}
          >
            Tất cả
          </button>
        </div>

        <form
          className="mt-3 d-flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            void load()
          }}
        >
          <input
            className="form-control"
            style={{ maxWidth: 320 }}
            placeholder="Tìm mã đơn, SĐT, tên khách..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Tìm
          </button>
        </form>
      </div>

      <DataTable columns={columns} data={rows} loading={loading} rowKey={(o) => o.id} />

      {totalPages > 1 ? (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </button>
          <span className="align-self-center small text-muted">
            Trang {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      ) : null}
    </div>
  )
}
