import type { NavMegaGroup } from "@/config/productFacets"
import { MEN_NAV_GROUPS, WOMEN_NAV_GROUPS, productsUrl } from "@/config/productFacets"

export type { NavMegaGroup, NavFacetItem } from "@/config/productFacets"

export type MainNavItem =
  | { type: "link"; label: string; to: string }
  | { type: "mega"; label: string; gender: "nam" | "nu"; groups: NavMegaGroup[] }
  | { type: "dropdown"; label: string; items: { label: string; to: string }[] }

/** Menu chính — Nam, Nữ, Bộ sưu tập, Về chúng tôi */
export const MAIN_NAV: MainNavItem[] = [
  {
    type: "mega",
    label: "Nam",
    gender: "nam",
    groups: MEN_NAV_GROUPS,
  },
  {
    type: "mega",
    label: "Nữ",
    gender: "nu",
    groups: WOMEN_NAV_GROUPS,
  },
  {
    type: "dropdown",
    label: "Bộ sưu tập",
    items: [
      { label: "Tất cả sản phẩm", to: "/products" },
      { label: "Sản phẩm mới", to: productsUrl({ collection: "new" }) },
      { label: "Khuyến mãi", to: productsUrl({ collection: "sale" }) },
      { label: "Bán chạy", to: productsUrl({ collection: "bestseller" }) },
    ],
  },
  { type: "link", label: "Về chúng tôi", to: "/about" },
]

export const HEADER_PROMO = {
  label: "Ưu đãi từ 499K",
  to: productsUrl({ collection: "promo" }),
} as const

export function isNavLinkActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/"
  const base = to.split("?")[0]
  return pathname === base || pathname.startsWith(`${base}/`)
}
