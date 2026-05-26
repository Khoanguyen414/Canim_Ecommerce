import type { ReactNode } from "react"
import { HeaderNavMenu } from "@/components/layout/HeaderNavMenu"
import { ShopLogoLink } from "@/components/layout/ShopLogoLink"

type Props = {
  pathname: string
  search: string
  searchBlock: ReactNode
  accountMenu: ReactNode
  wishlistBtn: ReactNode
  cartBtn: ReactNode
  onNavClick: () => void
}

export function HeaderDesktopIvy({
  pathname,
  search,
  searchBlock,
  accountMenu,
  wishlistBtn,
  cartBtn,
  onNavClick,
}: Props) {
  return (
    <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-5">
      <HeaderNavMenu
        pathname={pathname}
        search={search}
        variant="desktop"
        onNavigate={onNavClick}
      />

      <ShopLogoLink className="justify-self-center" onNavigate={onNavClick} />

      <div className="flex items-center justify-end gap-1">
        <div className="w-full max-w-[280px] xl:max-w-[340px]">{searchBlock}</div>
        {wishlistBtn}
        {accountMenu}
        {cartBtn}
      </div>
    </div>
  )
}
