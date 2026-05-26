import canimLogo from "@/assets/brand/canim-logo.png"
import { useCleanedLogo } from "@/hooks/useCleanedLogo"

type Props = {
  variant?: "header" | "promo"
  className?: string
}

export function AdminBrandLogo({ variant = "header", className = "" }: Props) {
  const cleanedSrc = useCleanedLogo(canimLogo)

  return (
    <img
      src={cleanedSrc ?? canimLogo}
      alt="Canim"
      draggable={false}
      decoding="async"
      className={`admin-brand-logo admin-brand-logo--${variant}${className ? ` ${className}` : ""}`}
    />
  )
}
