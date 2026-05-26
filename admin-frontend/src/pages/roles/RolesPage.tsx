import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Modal } from "@/components/ui/Modal"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { roleService } from "@/services/role.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { RoleRecord } from "@/types/api"

export function RolesPage() {
  const [rows, setRows] = useState<RoleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [roleName, setRoleName] = useState("ROLE_")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await roleService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được vai trò")
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = roleName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await roleService.create(name.startsWith("ROLE_") ? name : `ROLE_${name}`)
      setSuccess("Đã tạo vai trò")
      setModalOpen(false)
      setRoleName("ROLE_")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa vai trò "${name}"?`)) return
    try {
      await roleService.remove(id)
      setSuccess("Đã xóa vai trò")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const columns: Column<RoleRecord>[] = [
    {
      key: "name",
      header: "Tên vai trò",
      render: (row) => <span className="cell-title">{row.name}</span>,
    },
    {
      key: "id",
      header: "ID",
      render: (row) => <span className="td-muted">{row.id}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="td-actions">
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
        title="Vai trò"
        description="Danh sách vai trò hệ thống — API /roles."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Thêm vai trò
          </button>
        }
      />
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}
      <DataTable columns={columns} data={rows} loading={loading} rowKey={(r) => r.id} />
      <Modal
        open={modalOpen}
        title="Thêm vai trò"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button type="submit" form="role-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Tạo"}
            </button>
          </>
        }
      >
        <form id="role-form" onSubmit={(e) => void handleCreate(e)}>
          <div className="form-field">
            <label htmlFor="role-name">Tên (vd: ROLE_MANAGER)</label>
            <input
              id="role-name"
              className="form-control"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
