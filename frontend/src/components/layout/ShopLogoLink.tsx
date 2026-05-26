import type { MouseEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import canimLogo from "@/assets/brand/canim-logo.png"
import { useCleanedLogo } from "@/hooks/useCleanedLogo"
import { cn } from "@/lib/cn"

type ShopLogoLinkProps = {
  className?: string
  imgClassName?: string
  onNavigate?: () => void
}

export function ShopLogoLink({ className, imgClassName, onNavigate }: ShopLogoLinkProps) {
  const { pathname } = useLocation()
  const cleanedSrc = useCleanedLogo(canimLogo)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.()
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <Link
      to="/"
      className={cn("shop-logo-link inline-flex shrink-0 items-center", className)}
      onClick={handleClick}
      aria-label="Về trang chủ Canim"
    >
      <img
        src={cleanedSrc ?? canimLogo}
        alt="Canim"
        loading="eager"
        decoding="async"
        draggable={false}
        className={cn("shop-logo-img", imgClassName)}
      />
    </Link>
  )
}
