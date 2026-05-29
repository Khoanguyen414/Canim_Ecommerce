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

export function InboundPage() {
  const {
    warehouses,
    suppliers,
    variantOptions,
    warehouseId,
    setWarehouseId,
    loading,
    error,
    load,
    resolvedWarehouseId,
  } = useInventoryMasterData()

  const [supplierId, setSupplierId] = useState<number | "">("")
  const [variantId, setVariantId] = useState<number | "">("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
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
    if (supplierId === "") {
      setSubmitError("Chọn nhà cung cấp.")
      return
    }
    if (variantId === "") {
      setSubmitError("Chọn biến thể sản phẩm.")
      return
    }
    const qty = Number(quantity)
    const unitPrice = Number(price)
    if (!Number.isFinite(qty) || qty <= 0) {
      setSubmitError("Số lượng phải lớn hơn 0.")
      return
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setSubmitError("Đơn giá nhập không hợp lệ.")
      return
    }

    setSaving(true)
    try {
      const { data } = await inventoryService.inbound({
        warehouseId: whId,
        supplierId: Number(supplierId),
        note: note.trim() || undefined,
        items: [{ variantId: Number(variantId), quantity: qty, price: unitPrice }],
      })
      if (!data.success) throw new Error(data.message ?? "Nhập kho thất bại")
      setSuccess(data.message ?? "Nhập kho thành công.")
      setVariantId("")
      setQuantity("")
      setPrice("")
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
        <span aria-current="page">Nhập kho</span>
      </nav>

      <PageHeader
        title="Nhập kho"
        description="Tạo phiếu nhập — API POST /inventory/inbound (theo lô, NCC bắt buộc)."
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

            <div className="form-field">
              <label htmlFor="supplier-select">Nhà cung cấp</label>
              <select
                id="supplier-select"
                className="form-control"
                value={supplierId === "" ? "" : String(supplierId)}
                disabled={saving || suppliers.length === 0}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">— Chọn NCC —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.supplierCode ? ` (${s.supplierCode})` : ""}
                  </option>
                ))}
              </select>
              {suppliers.length === 0 ? (
                <p className="form-text">
                  Chưa có NCC — <Link to="/suppliers">thêm nhà cung cấp</Link>.
                </p>
              ) : null}
            </div>

            <VariantSelect options={variantOptions} value={variantId} onChange={setVariantId} disabled={saving} />

            <div className="form-field">
              <label htmlFor="in-qty">Số lượng</label>
              <input
                id="in-qty"
                className="form-control"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-field">
              <label htmlFor="in-price">Đơn giá nhập (VNĐ)</label>
              <input
                id="in-price"
                className="form-control"
                type="number"
                min={0}
                step="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-field full">
              <label htmlFor="in-note">Ghi chú</label>
              <textarea
                id="in-note"
                className="form-control"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-actions full">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Đang gửi..." : "Tạo phiếu nhập"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
