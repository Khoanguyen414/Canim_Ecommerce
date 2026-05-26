const POINTS = [42, 58, 45, 72, 68, 85, 78, 92, 88, 95, 82, 110, 98, 105, 118, 112, 125, 130, 122, 140, 135, 148, 142, 155, 150, 162, 158, 170, 165, 178]

function buildPath(values: number[], w: number, h: number, pad: number) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = (w - pad * 2) / (values.length - 1)
  const coords = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  return coords.join(" ")
}

export function RevenueChart() {
  const w = 640
  const h = 200
  const pad = 12
  const line = buildPath(POINTS, w, h, pad)
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`

  return (
    <div className="chart-revenue">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Biểu đồ doanh thu tháng">
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.35)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0.02)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={pad} x2={w - pad} y1={h * r} y2={h * r} className="chart-grid-line" />
        ))}
        <polygon points={area} fill="url(#revenueFill)" />
        <polyline points={line} fill="none" className="chart-line" />
        <circle cx={w - pad} cy={pad + 8} r="5" className="chart-dot" />
      </svg>
      <div className="chart-x-labels">
        {["1", "5", "10", "15", "20", "25", "30"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  )
}
