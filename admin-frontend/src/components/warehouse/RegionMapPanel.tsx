import { REGION_MARKERS } from "@/pages/inventory/warehouse-hub-data"

export function RegionMapPanel() {
  return (
    <div className="wh-map-panel">
      <svg viewBox="0 0 100 90" className="wh-map-svg" role="img" aria-label="Phân bổ kho theo khu vực">
        <path
          d="M48 8 L62 14 L68 22 L72 32 L70 42 L64 50 L58 58 L52 68 L46 78 L40 82 L34 76 L30 66 L28 54 L30 42 L34 30 L40 18 Z"
          fill="#f5efe6"
          stroke="#e8dcc8"
          strokeWidth="0.8"
        />
        <path
          d="M44 72 L48 58 L54 48 L60 40 L66 36 L68 44 L64 54 L58 64 L52 72 Z"
          fill="#ede4d4"
          stroke="#e8dcc8"
          strokeWidth="0.6"
        />
        {REGION_MARKERS.map((m) => (
          <g key={m.city}>
            <circle cx={m.x} cy={m.y} r="3.2" fill="var(--gold)" stroke="#fff" strokeWidth="1" />
            <circle cx={m.x} cy={m.y} r="6" fill="var(--gold)" opacity="0.2" />
          </g>
        ))}
      </svg>
      <ul className="wh-map-legend">
        {REGION_MARKERS.map((m) => (
          <li key={m.city}>
            <span className="wh-map-dot" />
            <span>
              {m.city}
              <strong>{m.count} kho</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
