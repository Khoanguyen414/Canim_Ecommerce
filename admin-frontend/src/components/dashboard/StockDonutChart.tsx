type Slice = { label: string; value: number; color: string }

type Props = {
  inStock?: number
  lowStock?: number
  outOfStock?: number
}

function buildSlices(counts: Props): Slice[] {
  const inStock = counts.inStock ?? 0
  const lowStock = counts.lowStock ?? 0
  const outOfStock = counts.outOfStock ?? 0
  const total = inStock + lowStock + outOfStock
  if (total === 0) {
    return [
      { label: "Còn hàng", value: 0, color: "#22c55e" },
      { label: "Sắp hết", value: 0, color: "#f59e0b" },
      { label: "Hết hàng", value: 0, color: "#ef4444" },
    ]
  }
  return [
    { label: "Còn hàng", value: inStock, color: "#22c55e" },
    { label: "Sắp hết", value: lowStock, color: "#f59e0b" },
    { label: "Hết hàng", value: outOfStock, color: "#ef4444" },
  ]
}

export function StockDonutChart({ inStock = 0, lowStock = 0, outOfStock = 0 }: Props) {
  const SLICES = buildSlices({ inStock, lowStock, outOfStock })
  const total = SLICES.reduce((s, x) => s + x.value, 0)
  let offset = 0
  const r = 42
  const c = 2 * Math.PI * r

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" className="donut-svg" role="img" aria-label="Tỷ lệ tồn kho">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {SLICES.map((slice) => {
          const len = (slice.value / total) * c
          const dash = `${len} ${c - len}`
          const el = (
            <circle
              key={slice.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          )
          offset += len
          return el
        })}
        <text x="60" y="56" textAnchor="middle" className="donut-center-num">
          {total}
        </text>
        <text x="60" y="72" textAnchor="middle" className="donut-center-label">
          SKU
        </text>
      </svg>
      <ul className="donut-legend">
        {SLICES.map((s) => (
          <li key={s.label}>
            <span className="donut-swatch" style={{ background: s.color }} />
            {s.label}
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
