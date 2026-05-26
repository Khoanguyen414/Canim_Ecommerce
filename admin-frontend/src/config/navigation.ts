import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  FolderTree,
  Image,
  LayoutDashboard,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
  Warehouse,
} from "lucide-react"

export type NavChild = {
  to?: string
  label: string
  soon?: boolean
}

export type NavItem = {
  to?: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: "outline" | "filled"
  badgeText?: string
  highlight?: boolean
  soon?: boolean
}

export type NavGroup = {
  type: "group"
  label: string
  icon: LucideIcon
  children: NavChild[]
  defaultOpen?: boolean
}

export type NavEntry = NavItem | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "type" in entry && entry.type === "group"
}

export const navEntries: NavEntry[] = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { label: "Đơn hàng", icon: ShoppingBag, badge: "filled", badgeText: "32", soon: true },
  { to: "/products", label: "Sản phẩm", icon: Tag },
  { to: "/categories", label: "Danh mục", icon: FolderTree },
  {
    type: "group",
    label: "Tồn kho",
    icon: Warehouse,
    defaultOpen: true,
    children: [
      { to: "/warehouses", label: "Kho hàng" },
      { to: "/warehouses/import", label: "Nhập kho", soon: true },
      { to: "/warehouses/export", label: "Xuất kho", soon: true },
      { to: "/warehouses/transfer", label: "Chuyển kho", soon: true },
      { to: "/warehouses/stock-check", label: "Kiểm kê", soon: true },
    ],
  },
  { to: "/users", label: "Khách hàng", icon: Users },
  { label: "Mã giảm giá", icon: Percent, soon: true },
  { label: "Đánh giá", icon: Star, soon: true },
  { label: "Thống kê", icon: BarChart3, soon: true },
  { label: "Banner", icon: Image, soon: true },
  { label: "Cài đặt", icon: Settings, soon: true },
]

/** @deprecated use navEntries */
export const navItems: NavItem[] = navEntries.filter((e): e is NavItem => !isNavGroup(e))
