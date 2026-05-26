import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { Modal } from "@/components/ui/Modal"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { categoryService, type CategoryPayload } from "@/services/category.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { Category } from "@/types/api"

function toTableRows(nodes: Category[]): (Category & { depth: number })[] {
  return nodes.map((node) => ({ ...node, depth: 0 }))
}

const emptyForm: CategoryPayload = { name: "", description: "", parentId: null }

export function CategoriesPage() {
  const [rows, setRows] = useState<(Category & { depth: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryPayload>(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await categoryService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được danh mục")
      setRows(toTableRows(data.result ?? []))
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

  const parentOptions = useMemo(
    () => rows.filter((r) => r.id !== editingId).map((r) => ({ id: r.id, label: `${"— ".repeat(r.depth)}${r.name}` })),
    [rows, editingId],
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: Category) => {
    setEditingId(row.id)
    setForm({
      name: row.name,
      description: row.description ?? "",
      parentId: row.parentId ?? null,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload: CategoryPayload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        parentId: form.parentId ? Number(form.parentId) : null,
      }
      if (editingId) {
        await categoryService.update(editingId, payload)
        setSuccess("Đã cập nhật danh mục")
      } else {
        await categoryService.create(payload)
        setSuccess("Đã tạo danh mục mới")
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
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return
    setError(null)
    setSuccess(null)
    try {
      await categoryService.remove(id)
      setSuccess("Đã xóa danh mục")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const columns: Column<Category & { depth: number }>[] = [
    {
      key: "name",
      header: "Tên danh mục",
      render: (row) => (
        <div>
          <div className="cell-title" style={{ paddingLeft: row.depth * 12 }}>
            {row.depth > 0 ? "└ " : ""}
            {row.name}
          </div>
          <div className="cell-sub">{row.slug}</div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Danh mục cha",
      render: (row) => <span className="td-muted">{row.parentName ?? "—"}</span>,
    },
    {
      key: "description",
      header: "Mô tả",
      render: (row) => <span className="td-muted">{row.description || "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="td-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil size={14} />
            Sửa
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
        title="Danh mục"
        description="Quản lý cây danh mục sản phẩm — đồng bộ trực tiếp với API /categories."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm danh mục
          </button>
        }
      />

      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}

      <DataTable columns={columns} data={rows} loading={loading} rowKey={(r) => r.id} emptyMessage="Chưa có danh mục" />

      <Modal
        open={modalOpen}
        title={editingId ? "Sửa danh mục" : "Thêm danh mục"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button type="submit" form="category-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <form id="category-form" className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-field full">
            <label htmlFor="cat-name">Tên *</label>
            <input
              id="cat-name"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-field full">
            <label htmlFor="cat-parent">Danh mục cha</label>
            <select
              id="cat-parent"
              className="form-control"
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))
              }
            >
              <option value="">— Không có —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field full">
            <label htmlFor="cat-desc">Mô tả</label>
            <textarea
              id="cat-desc"
              className="form-control"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
