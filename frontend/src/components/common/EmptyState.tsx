import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Icon className="h-14 w-14 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
