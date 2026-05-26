import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Modal } from "@/components/ui/Modal"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { userService, type UserUpdatePayload } from "@/services/user.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { UserRecord } from "@/types/api"

const ALL_ROLES = ["ROLE_USER", "ROLE_ADMIN", "ROLE_WAREHOUSE"] as const

function roleLabel(role: string) {
  return role.replace(/^ROLE_/, "")
}

export function UsersPage() {
  const [rows, setRows] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [form, setForm] = useState<UserUpdatePayload>({ fullName: "", phone: "", roles: [] })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await userService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được người dùng")
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

  const openEdit = (user: UserRecord) => {
    setEditing(user)
    setForm({
      fullName: user.fullName,
      phone: user.phone ?? "",
      roles: [...(user.roles ?? [])],
    })
    setModalOpen(true)
  }

  const toggleRole = (role: string) => {
    setForm((f) => {
      const current = f.roles ?? []
      return {
        ...f,
        roles: current.includes(role) ? current.filter((r) => r !== role) : [...current, role],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await userService.update(editing.id, {
        fullName: form.fullName?.trim(),
        phone: form.phone?.trim() || undefined,
        roles: form.roles,
      })
      setSuccess("Đã cập nhật người dùng")
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: UserRecord) => {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) return
    try {
      await userService.remove(user.id)
      setSuccess("Đã xóa người dùng")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const columns: Column<UserRecord>[] = [
    {
      key: "user",
      header: "Người dùng",
      render: (row) => (
        <div>
          <div className="cell-title">{row.fullName}</div>
          <span className="cell-sub">{row.email}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Điện thoại",
      render: (row) => row.phone || "—",
    },
    {
      key: "roles",
      header: "Vai trò",
      render: (row) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(row.roles ?? []).map((r) => (
            <Badge key={r} variant={r.includes("ADMIN") ? "warning" : "neutral"}>
              {roleLabel(r)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "active",
      header: "Trạng thái",
      render: (row) => (
        <Badge variant={row.active ? "success" : "danger"}>{row.active ? "Hoạt động" : "Khóa"}</Badge>
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
          <button type="button" className="btn btn-danger btn-sm" onClick={() => void handleDelete(row)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản và phân quyền — API /users (yêu cầu ADMIN)."
      />
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}
      <DataTable columns={columns} data={rows} loading={loading} rowKey={(r) => r.id} />
      <Modal
        open={modalOpen}
        title={`Sửa: ${editing?.email ?? ""}`}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button type="submit" form="user-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <form id="user-form" className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-field full">
            <label htmlFor="user-name">Họ tên</label>
            <input
              id="user-name"
              className="form-control"
              value={form.fullName ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
          </div>
          <div className="form-field full">
            <label htmlFor="user-phone">Điện thoại</label>
            <input
              id="user-phone"
              className="form-control"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="form-field full">
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Vai trò</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: 6 }}>
              {ALL_ROLES.map((role) => (
                <label key={role} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={(form.roles ?? []).includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {roleLabel(role)}
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
