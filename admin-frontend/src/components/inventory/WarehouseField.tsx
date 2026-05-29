import type { Warehouse } from "@/types/api"

type Props = {
  warehouses: Warehouse[]
  value: number | ""
  onChange: (id: number | "") => void
  disabled?: boolean
}

export function WarehouseField({ warehouses, value, onChange, disabled }: Props) {
  return (
    <div className="form-field">
      <label htmlFor="warehouse-select">Kho</label>
      <select
        id="warehouse-select"
        className="form-control"
        value={value === "" ? "" : String(value)}
        disabled={disabled || warehouses.length === 0}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
      >
        {warehouses.length === 0 ? <option value="">Chưa có kho — tạo tại Quản lý kho</option> : null}
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
            {w.address ? ` — ${w.address}` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}
