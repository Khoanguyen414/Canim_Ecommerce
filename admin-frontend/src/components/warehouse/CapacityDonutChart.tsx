type Props = {
  used: number
  total: number
}

export function CapacityDonutChart({ used, total }: Props) {
  const empty = Math.max(0, total - used)
  const slices = [
    { label: "Đã sử dụng", value: used, color: "var(--gold)" },
    { label: "Còn trống", value: empty, color: "#f5efe6" },
  ]
  const sum = slices.reduce((s, x) => s + x.value, 0) || 1
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="wh-donut-wrap">
      <svg viewBox="0 0 120 120" className="wh-donut-svg" role="img" aria-label="Tỷ lệ sử dụng sức chứa">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f5efe6" strokeWidth="14" />
        {slices.map((slice) => {
          const len = (slice.value / sum) * c
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
        <text x="60" y="52" textAnchor="middle" className="wh-donut-center-label">
          Tổng sức chứa
        </text>
        <text x="60" y="70" textAnchor="middle" className="wh-donut-center-num">
          {total.toLocaleString("vi-VN")} m²
        </text>
      </svg>
      <ul className="wh-donut-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <span className="wh-donut-swatch" style={{ background: s.color }} />
            {s.label}
            <strong>{Math.round((s.value / sum) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
