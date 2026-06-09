import { useState } from "react"
import { normalizeSizeValue, orderSizes } from "@/lib/productVariants"

type SizeSelectorProps = {
  selectedSizes: string[]
  onChange: (sizes: string[]) => void
  error?: string
  suggestions?: string[]
}

export function SizeSelector({ selectedSizes, onChange, error, suggestions = [] }: SizeSelectorProps) {
  const [draft, setDraft] = useState("")

  const setSizes = (sizes: string[]) => {
    onChange(orderSizes(sizes))
  }

  const addSize = (value = draft) => {
    const size = normalizeSizeValue(value)
    if (!size) return
    setSizes([...selectedSizes, size])
    setDraft("")
  }

  const removeSize = (size: string) => {
    const key = normalizeSizeValue(size).toLowerCase()
    setSizes(selectedSizes.filter((item) => normalizeSizeValue(item).toLowerCase() !== key))
  }

  const toggleSuggestion = (size: string) => {
    const active = selectedSizes.some(
      (item) => normalizeSizeValue(item).toLowerCase() === normalizeSizeValue(size).toLowerCase(),
    )
    if (active) {
      removeSize(size)
      return
    }
    addSize(size)
  }

  return (
    <div>
      <label className="form-label mb-2">Sizes</label>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {selectedSizes.length === 0 ? (
          <span className="text-muted small">Chua co size.</span>
        ) : (
          selectedSizes.map((size) => (
            <span
              key={size}
              className="badge rounded-pill text-bg-light border d-inline-flex align-items-center gap-2 px-3 py-2"
            >
              <span>{size}</span>
              <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => removeSize(size)}>
                x
              </button>
            </span>
          ))
        )}
      </div>
      <div className="input-group input-group-sm" style={{ maxWidth: "320px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="VD: S, 39, Free size, 18cm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addSize()
            }
          }}
        />
        <button type="button" className="btn btn-outline-primary" onClick={() => addSize()}>
          Add Size
        </button>
      </div>
      {suggestions.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {suggestions.map((size) => {
            const active = selectedSizes.some(
              (item) => normalizeSizeValue(item).toLowerCase() === normalizeSizeValue(size).toLowerCase(),
            )

            return (
            <button
              key={size}
              type="button"
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ minWidth: "2.75rem" }}
              onClick={() => toggleSuggestion(size)}
            >
              {size}
            </button>
            )
          })}
        </div>
      ) : null}
      {error ? <div className="form-text text-danger mt-2">{error}</div> : null}
    </div>
  )
}
