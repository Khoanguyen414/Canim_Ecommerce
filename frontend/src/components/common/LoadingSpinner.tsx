import { Loader2 } from "lucide-react"
import { cn } from "@/utils/cn"

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  )
}
