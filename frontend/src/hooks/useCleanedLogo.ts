import { useEffect, useState } from "react"
import { cleanLogoImageData } from "@/lib/cleanLogoPixels"

export function useCleanedLogo(src: string): string | null {
  const [cleaned, setCleaned] = useState<string | null>(null)

  useEffect(() => {
    let revoked: string | null = null
    let cancelled = false

    const img = new Image()
    img.src = src

    img.onload = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(img, 0, 0)

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        cleanLogoImageData(data)
        ctx.putImageData(data, 0, 0)

        canvas.toBlob((blob) => {
          if (cancelled || !blob) return
          const url = URL.createObjectURL(blob)
          revoked = url
          setCleaned(url)
        }, "image/png")
      } catch {
        /* fallback src gốc */
      }
    }

    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [src])

  return cleaned
}
