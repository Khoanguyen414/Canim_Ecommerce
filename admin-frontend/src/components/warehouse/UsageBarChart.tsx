type Bar = { name: string; rate: number }

type Props = {
  items: Bar[]
}

export function UsageBarChart({ items }: Props) {
  return (
    <ul className="wh-bar-list">
      {items.map((item) => (
        <li key={item.name} className="wh-bar-item">
          <div className="wh-bar-head">
            <span className="wh-bar-name">{item.name}</span>
            <span className="wh-bar-rate">{item.rate}%</span>
          </div>
          <div className="wh-bar-track">
            <div className="wh-bar-fill" style={{ width: `${item.rate}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
