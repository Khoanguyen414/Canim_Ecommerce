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
    <div className="section-shell flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="rounded-2xl bg-primary/10 p-4 text-primary">
        <Icon className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {description ? <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-2 px-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
