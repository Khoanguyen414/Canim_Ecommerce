import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="section-shell flex w-full max-w-xl items-start gap-3 border-destructive/25 bg-destructive/5 px-5 py-4 text-left text-destructive">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" className="min-w-32" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
