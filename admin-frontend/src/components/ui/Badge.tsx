import type { ReactNode } from "react"

type BadgeVariant = "success" | "danger" | "neutral" | "warning"

type BadgeProps = {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
