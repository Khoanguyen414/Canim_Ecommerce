import type { VariantOption } from "@/hooks/useInventoryMasterData"

type Props = {
  options: VariantOption[]
  value: number | ""
  onChange: (variantId: number | "") => void
  disabled?: boolean
  id?: string
}

export function VariantSelect({ options, value, onChange, disabled, id = "variant-select" }: Props) {
  const selected = value !== "" ? options.find((o) => o.variantId === value) : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>Biến thể (SKU)</label>
      <select
        id={id}
        className="form-control"
        value={value === "" ? "" : String(value)}
        disabled={disabled || options.length === 0}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
      >
        <option value="">— Chọn biến thể —</option>
        {options.map((o) => (
          <option key={o.variantId} value={o.variantId}>
            {o.label} (tồn: {o.availableQty})
          </option>
        ))}
      </select>
      {selected ? (
        <p className="form-text">
          SKU: <code>{selected.sku}</code> — Tồn khả dụng: <strong>{selected.availableQty}</strong>
        </p>
      ) : null}
    </div>
  )
}
