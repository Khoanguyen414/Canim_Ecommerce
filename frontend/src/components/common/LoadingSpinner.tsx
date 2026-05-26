import { Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)} role="status" aria-live="polite">
      <div className="surface-glass rounded-2xl px-8 py-6 text-center shadow-lg shadow-primary/5">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" aria-hidden />
        {label ? <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p> : null}
      </div>
    </div>
  )
}
