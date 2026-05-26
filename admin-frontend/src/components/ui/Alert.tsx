import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"

type AlertProps = {
  variant: "error" | "success"
  children: ReactNode
  onDismiss?: () => void
}

export function Alert({ variant, children, onDismiss }: AlertProps) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <Icon size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
          Đóng
        </button>
      ) : null}
    </div>
  )
}
