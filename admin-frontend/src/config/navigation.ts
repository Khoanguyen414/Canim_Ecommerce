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
  { to: "/orders", label: "Đơn hàng", icon: ShoppingBag },
  { to: "/products", label: "Sản phẩm", icon: Tag },
  { to: "/categories", label: "Danh mục", icon: FolderTree },
  {
    type: "group",
    label: "Tồn kho",
    icon: Warehouse,
    defaultOpen: true,
    children: [
      { to: "/warehouses", label: "Tổng quan kho" },
      { to: "/warehouses/manage", label: "Quản lý kho" },
      { to: "/warehouses/import", label: "Nhập kho" },
      { to: "/warehouses/export", label: "Xuất kho" },
      { to: "/warehouses/stock-check", label: "Kiểm kê" },
      { to: "/suppliers", label: "Nhà cung cấp" },
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
