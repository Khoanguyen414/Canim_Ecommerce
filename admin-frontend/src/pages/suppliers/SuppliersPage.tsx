import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Modal } from "@/components/ui/Modal"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { supplierService, type SupplierPayload } from "@/services/supplier.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { Supplier } from "@/types/api"

const emptyForm: SupplierPayload = {
  code: "",
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
}

export function SuppliersPage() {
  const [rows, setRows] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SupplierPayload>(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await supplierService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được nhà cung cấp")
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

  const openEdit = (row: Supplier) => {
    setEditingId(row.id)
    setForm({
      code: row.supplierCode ?? "",
      name: row.name,
      contactPerson: row.contactName ?? "",
      email: row.email,
      phone: row.phone,
      address: row.address ?? "",
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload: SupplierPayload = {
        code: form.code.trim(),
        name: form.name.trim(),
        contactPerson: form.contactPerson?.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address?.trim() || undefined,
      }
      if (editingId) {
        await supplierService.update(editingId, payload)
        setSuccess("Đã cập nhật nhà cung cấp")
      } else {
        await supplierService.create(payload)
        setSuccess("Đã thêm nhà cung cấp")
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
    if (!window.confirm(`Xóa nhà cung cấp "${name}"?`)) return
    try {
      await supplierService.remove(id)
      setSuccess("Đã xóa nhà cung cấp")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const columns: Column<Supplier>[] = [
    {
      key: "code",
      header: "Mã",
      render: (row) => <span className="cell-title">{row.supplierCode ?? "—"}</span>,
    },
    {
      key: "name",
      header: "Tên",
      render: (row) => (
        <div>
          <div className="cell-title">{row.name}</div>
          <div className="cell-sub">{row.contactName || "—"}</div>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "phone", header: "Điện thoại", render: (row) => row.phone },
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
        title="Nhà cung cấp"
        description="Quản lý đối tác nhập hàng — API /suppliers."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm NCC
          </button>
        }
      />
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}
      <DataTable columns={columns} data={rows} loading={loading} rowKey={(r) => r.id} />
      <Modal
        open={modalOpen}
        title={editingId ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        onClose={() => setModalOpen(false)}
        wide
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button type="submit" form="supplier-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <form id="supplier-form" className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-field">
            <label htmlFor="sup-code">Mã NCC *</label>
            <input
              id="sup-code"
              className="form-control"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              disabled={Boolean(editingId)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="sup-name">Tên *</label>
            <input
              id="sup-name"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="sup-contact">Người liên hệ</label>
            <input
              id="sup-contact"
              className="form-control"
              value={form.contactPerson ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="sup-email">Email *</label>
            <input
              id="sup-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="sup-phone">Điện thoại *</label>
            <input
              id="sup-phone"
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
          </div>
          <div className="form-field full">
            <label htmlFor="sup-address">Địa chỉ</label>
            <textarea
              id="sup-address"
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
