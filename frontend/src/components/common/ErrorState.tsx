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
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive max-w-lg">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
