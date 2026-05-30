import { useState } from "react"
import type { ProductColor } from "@/lib/productVariants"
import { createColorId, isDuplicateColor, normalizeColorName } from "@/lib/productVariants"

type ColorManagerProps = {
  colors: ProductColor[]
  onChange: (colors: ProductColor[]) => void
  error?: string
}

export function ColorManager({ colors, onChange, error }: ColorManagerProps) {
  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const addColor = () => {
    const name = normalizeColorName(draft)
    if (!name) {
      setLocalError("Nhập tên màu.")
      return
    }
    if (isDuplicateColor(name, colors)) {
      setLocalError("Màu đã tồn tại.")
      return
    }
    onChange([...colors, { id: createColorId(), name }])
    setDraft("")
    setLocalError(null)
  }

  const removeColor = (id: string) => {
    onChange(colors.filter((c) => c.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditDraft("")
    }
  }

  const startEdit = (color: ProductColor) => {
    setEditingId(color.id)
    setEditDraft(color.name)
    setLocalError(null)
  }

  const saveEdit = () => {
    if (!editingId) return
    const name = normalizeColorName(editDraft)
    if (!name) {
      setLocalError("Tên màu không được trống.")
      return
    }
    if (isDuplicateColor(name, colors, editingId)) {
      setLocalError("Màu đã tồn tại.")
      return
    }
    onChange(colors.map((c) => (c.id === editingId ? { ...c, name } : c)))
    setEditingId(null)
    setEditDraft("")
    setLocalError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft("")
    setLocalError(null)
  }

  return (
    <div>
      <label className="form-label mb-2">Colors</label>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {colors.length === 0 ? (
          <span className="text-muted small">Chưa có màu — thêm ít nhất một màu.</span>
        ) : (
          colors.map((color) =>
            editingId === color.id ? (
              <div key={color.id} className="input-group input-group-sm" style={{ maxWidth: "220px" }}>
                <input
                  type="text"
                  className="form-control"
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      saveEdit()
                    }
                    if (e.key === "Escape") cancelEdit()
                  }}
                  autoFocus
                />
                <button type="button" className="btn btn-primary" onClick={saveEdit}>
                  OK
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Hủy
                </button>
              </div>
            ) : (
              <span key={color.id} className="badge rounded-pill text-bg-light border d-inline-flex align-items-center gap-2 px-3 py-2">
                <span>{color.name}</span>
                <button type="button" className="btn btn-link btn-sm p-0 text-secondary" onClick={() => startEdit(color)} aria-label={`Sửa ${color.name}`}>
                  Sửa
                </button>
                <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => removeColor(color.id)} aria-label={`Xóa ${color.name}`}>
                  ×
                </button>
              </span>
            ),
          )
        )}
      </div>
      <div className="input-group input-group-sm" style={{ maxWidth: "320px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="VD: Trắng, Xanh navy…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addColor()
            }
          }}
        />
        <button type="button" className="btn btn-outline-primary" onClick={addColor}>
          Add Color
        </button>
      </div>
      {localError ? <div className="form-text text-danger">{localError}</div> : null}
      {error ? <div className="form-text text-danger">{error}</div> : null}
    </div>
  )
}
