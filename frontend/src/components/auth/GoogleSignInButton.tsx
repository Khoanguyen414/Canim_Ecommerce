import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { getGoogleClientId, loadGoogleIdentityScript } from "@/lib/googleIdentity"
import { cn } from "@/lib/cn"

type Props = {
  onCredential: (idToken: string) => void
  onError?: (message: string) => void
  disabled?: boolean
  className?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string; locale?: string },
          ) => void
        }
      }
    }
  }
}

export function GoogleSignInButton({ onCredential, onError, disabled, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const clientId = getGoogleClientId()

  useEffect(() => {
    if (!clientId || disabled) {
      setLoading(false)
      return
    }

    let cancelled = false

    void loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential)
            } else {
              onError?.("Không nhận được token từ Google")
            }
          },
        })

        containerRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
          locale: "vi",
        })
      })
      .catch(() => {
        onError?.("Không tải được Google Sign-In")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [clientId, disabled, onCredential, onError])

  if (!clientId) {
    return (
      <p className={cn("text-center text-xs text-stone-500", className)}>
        Google login is not configured yet.
      </p>
    )
  }

  if (loading) {
    return (
      <div className={cn("flex justify-center py-2", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
      </div>
    )
  }

  return <div ref={containerRef} className={cn("flex justify-center", className)} />
}
