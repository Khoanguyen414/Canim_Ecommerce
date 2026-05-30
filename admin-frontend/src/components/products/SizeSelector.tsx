import { STANDARD_SIZES } from "@/config/productSizes"

type SizeSelectorProps = {
  selectedSizes: string[]
  onChange: (sizes: string[]) => void
  error?: string
}

export function SizeSelector({ selectedSizes, onChange, error }: SizeSelectorProps) {
  const toggle = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size]
    onChange(STANDARD_SIZES.filter((s) => next.includes(s)))
  }

  return (
    <div>
      <label className="form-label mb-2">Sizes</label>
      <div className="d-flex flex-wrap gap-2">
        {STANDARD_SIZES.map((size) => {
          const active = selectedSizes.includes(size)
          return (
            <button
              key={size}
              type="button"
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ minWidth: "2.75rem" }}
              onClick={() => toggle(size)}
            >
              {size}
            </button>
          )
        })}
      </div>
      {error ? <div className="form-text text-danger mt-2">{error}</div> : null}
    </div>
  )
}
