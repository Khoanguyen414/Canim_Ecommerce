import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Modal } from "@/components/ui/Modal"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { warehouseService, type WarehousePayload } from "@/services/warehouse.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { Warehouse } from "@/types/api"

const emptyForm: WarehousePayload = { name: "", address: "" }

export function WarehousesPage() {
  const [rows, setRows] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<WarehousePayload>(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await warehouseService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được kho")
      setRows(data.result ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: Warehouse) => {
    setEditingId(row.id)
    setForm({ name: row.name, address: row.address ?? "" })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = { name: form.name.trim(), address: form.address?.trim() || undefined }
      if (editingId) {
        await warehouseService.update(editingId, payload)
        setSuccess("Đã cập nhật kho")
      } else {
        await warehouseService.create(payload)
        setSuccess("Đã thêm kho mới")
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa kho "${name}"?`)) return
    try {
      await warehouseService.remove(id)
      setSuccess("Đã xóa kho")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const columns: Column<Warehouse>[] = [
    {
      key: "name",
      header: "Tên kho",
      render: (row) => <span className="cell-title">{row.name}</span>,
    },
    {
      key: "address",
      header: "Địa chỉ",
      render: (row) => <span className="td-muted">{row.address || "—"}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => (
        <Badge variant={row.isActive !== false ? "success" : "neutral"}>
          {row.isActive !== false ? "Hoạt động" : "Tắt"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="td-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil size={14} />
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => void handleDelete(row.id, row.name)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Quản lý kho"
        description="Thêm, sửa, xóa kho — API /warehouses."
        actions={
          <>
          <Link to="/warehouses" className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} />
            Tổng quan kho
          </Link>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm kho
          </button>
          </>
        }
      />
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}
      <DataTable columns={columns} data={rows} loading={loading} rowKey={(r) => r.id} />
      <Modal
        open={modalOpen}
        title={editingId ? "Sửa kho" : "Thêm kho"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button type="submit" form="warehouse-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <form id="warehouse-form" className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-field full">
            <label htmlFor="wh-name">Tên kho *</label>
            <input
              id="wh-name"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-field full">
            <label htmlFor="wh-address">Địa chỉ</label>
            <textarea
              id="wh-address"
              className="form-control"
              rows={2}
              value={form.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
