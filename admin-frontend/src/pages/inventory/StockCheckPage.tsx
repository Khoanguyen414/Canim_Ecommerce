import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { WarehouseField } from "@/components/inventory/WarehouseField"
import { VariantSelect } from "@/components/inventory/VariantSelect"
import { useInventoryMasterData } from "@/hooks/useInventoryMasterData"
import { stockCheckService } from "@/services/stockCheck.service"
import { getApiErrorMessage } from "@/lib/apiError"

export function StockCheckPage() {
  const {
    warehouses,
    variantOptions,
    warehouseId,
    setWarehouseId,
    loading,
    error,
    load,
    resolvedWarehouseId,
    findVariant,
  } = useInventoryMasterData()

  const [variantId, setVariantId] = useState<number | "">("")
  const [systemQty, setSystemQty] = useState("")
  const [actualQty, setActualQty] = useState("")
  const [itemReason, setItemReason] = useState("")
  const [note, setNote] = useState("")
  const [completeIdInput, setCompleteIdInput] = useState("")
  const [lastDraft, setLastDraft] = useState<{ id: number; code: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onVariantChange = (id: number | "") => {
    setVariantId(id)
    if (id !== "") {
      const v = findVariant(id)
      if (v) setSystemQty(String(v.availableQty))
    }
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSuccess(null)

    const whId = resolvedWarehouseId()
    if (whId == null) {
      setSubmitError("Chọn kho hoặc tạo kho trước.")
      return
    }
    if (variantId === "") {
      setSubmitError("Chọn biến thể.")
      return
    }
    const sys = Number(systemQty)
    const act = Number(actualQty)
    if (!Number.isFinite(sys) || sys < 0 || !Number.isFinite(act) || act < 0) {
      setSubmitError("Tồn hệ thống và tồn thực tế phải ≥ 0.")
      return
    }

    setSaving(true)
    try {
      const { data } = await stockCheckService.create({
        warehouseId: whId,
        note: note.trim() || undefined,
        items: [
          {
            variantId: Number(variantId),
            systemQuantity: Math.floor(sys),
            actualQuantity: Math.floor(act),
            reason: itemReason.trim() || undefined,
          },
        ],
      })
      if (!data.success || !data.result) throw new Error(data.message ?? "Tạo phiếu thất bại")
      setLastDraft({ id: data.result.id, code: data.result.code })
      setSuccess(`Đã tạo phiếu kiểm kê ${data.result.code} (DRAFT).`)
      setVariantId("")
      setSystemQty("")
      setActualQty("")
      setItemReason("")
    } catch (err) {
      setSubmitError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setSubmitError(null)
    setSuccess(null)
    const manual = completeIdInput.trim() ? Number(completeIdInput.trim()) : NaN
    const id = lastDraft?.id ?? (Number.isFinite(manual) ? manual : NaN)
    if (!Number.isFinite(id)) {
      setSubmitError("Tạo phiếu DRAFT trước hoặc nhập ID phiếu.")
      return
    }

    setSaving(true)
    try {
      const { data } = await stockCheckService.complete(id)
      if (!data.success) throw new Error(data.message ?? "Hoàn tất thất bại")
      setSuccess(data.message ?? `Đã hoàn tất phiếu #${id}`)
      if (lastDraft?.id === id) setLastDraft(null)
      setCompleteIdInput("")
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
        <span aria-current="page">Kiểm kê</span>
      </nav>

      <PageHeader
        title="Kiểm kê kho"
        description="Tạo phiếu DRAFT rồi hoàn tất — API /stock-checks và /stock-checks/{id}/complete."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {submitError ? <Alert variant="error" onDismiss={() => setSubmitError(null)}>{submitError}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}

      <section className="card card-padded">
        {loading ? (
          <p className="text-muted">Đang tải dữ liệu...</p>
        ) : (
          <>
            <form className="form-grid form-grid-max" onSubmit={(e) => void handleCreateDraft(e)}>
              <WarehouseField warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} disabled={saving} />
              <VariantSelect options={variantOptions} value={variantId} onChange={onVariantChange} disabled={saving} />

              <div className="form-field">
                <label htmlFor="sc-system">Tồn hệ thống</label>
                <input
                  id="sc-system"
                  className="form-control"
                  type="number"
                  min={0}
                  value={systemQty}
                  onChange={(e) => setSystemQty(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-field">
                <label htmlFor="sc-actual">Tồn thực tế</label>
                <input
                  id="sc-actual"
                  className="form-control"
                  type="number"
                  min={0}
                  value={actualQty}
                  onChange={(e) => setActualQty(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-field full">
                <label htmlFor="sc-reason">Lý do dòng (tuỳ chọn)</label>
                <input
                  id="sc-reason"
                  className="form-control"
                  value={itemReason}
                  onChange={(e) => setItemReason(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-field full">
                <label htmlFor="sc-note">Ghi chú phiếu</label>
                <textarea
                  id="sc-note"
                  className="form-control"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-actions full">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Đang gửi..." : "Tạo phiếu DRAFT"}
                </button>
              </div>
            </form>

            <hr className="divider" style={{ margin: "1.5rem 0" }} />

            <div className="form-grid form-grid-max">
              <div className="form-field">
                <label htmlFor="sc-complete-id">ID phiếu hoàn tất (nếu cần)</label>
                <input
                  id="sc-complete-id"
                  className="form-control"
                  placeholder={lastDraft ? String(lastDraft.id) : "VD: 12"}
                  value={completeIdInput}
                  onChange={(e) => setCompleteIdInput(e.target.value)}
                  disabled={saving}
                />
              </div>
              {lastDraft ? (
                <p className="form-text full">
                  Phiếu chờ hoàn tất: <strong>{lastDraft.code}</strong> (ID {lastDraft.id})
                </p>
              ) : null}
              <div className="form-actions full">
                <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => void handleComplete()}>
                  Hoàn tất phiếu kiểm kê
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
