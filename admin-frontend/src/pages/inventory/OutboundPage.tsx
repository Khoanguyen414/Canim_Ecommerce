import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { WarehouseField } from "@/components/inventory/WarehouseField"
import { VariantSelect } from "@/components/inventory/VariantSelect"
import { useInventoryMasterData } from "@/hooks/useInventoryMasterData"
import { inventoryService } from "@/services/inventory.service"
import { getApiErrorMessage } from "@/lib/apiError"

export function OutboundPage() {
  const {
    warehouses,
    variantOptions,
    warehouseId,
    setWarehouseId,
    loading,
    error,
    load,
    resolvedWarehouseId,
  } = useInventoryMasterData()

  const [variantId, setVariantId] = useState<number | "">("")
  const [quantity, setQuantity] = useState("")
  const [orderId, setOrderId] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSuccess(null)

    const whId = resolvedWarehouseId()
    if (whId == null) {
      setSubmitError("Chọn kho hoặc tạo kho trước.")
      return
    }
    if (variantId === "") {
      setSubmitError("Chọn biến thể sản phẩm.")
      return
    }
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setSubmitError("Số lượng phải lớn hơn 0.")
      return
    }
    const oid = orderId.trim() ? Number(orderId) : undefined

    setSaving(true)
    try {
      const { data } = await inventoryService.outbound({
        warehouseId: whId,
        orderId: Number.isFinite(oid) ? oid : undefined,
        note: note.trim() || undefined,
        items: [{ variantId: Number(variantId), quantity: qty }],
      })
      if (!data.success) throw new Error(data.message ?? "Xuất kho thất bại")
      setSuccess(data.message ?? "Xuất kho thành công.")
      setVariantId("")
      setQuantity("")
      setOrderId("")
      setNote("")
      await load()
    } catch (err) {
      setSubmitError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <nav className="wh-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={14} aria-hidden />
        <Link to="/warehouses">Tồn kho</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">Xuất kho</span>
      </nav>

      <PageHeader
        title="Xuất kho"
        description="Tạo phiếu xuất — API POST /inventory/outbound (trừ tồn FIFO theo lô)."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {submitError ? <Alert variant="error" onDismiss={() => setSubmitError(null)}>{submitError}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}

      <section className="card card-padded">
        {loading ? (
          <p className="text-muted">Đang tải dữ liệu...</p>
        ) : (
          <form className="form-grid form-grid-max" onSubmit={(e) => void handleSubmit(e)}>
            <WarehouseField warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} disabled={saving} />
            <VariantSelect options={variantOptions} value={variantId} onChange={setVariantId} disabled={saving} />

            <div className="form-field">
              <label htmlFor="out-qty">Số lượng</label>
              <input
                id="out-qty"
                className="form-control"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-field">
              <label htmlFor="out-order">Mã đơn hàng (tuỳ chọn)</label>
              <input
                id="out-order"
                className="form-control"
                type="number"
                min={1}
                placeholder="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-field full">
              <label htmlFor="out-note">Ghi chú</label>
              <textarea
                id="out-note"
                className="form-control"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-actions full">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Đang gửi..." : "Tạo phiếu xuất"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
