export type WarehouseRow = {
  id: string
  code: string
  name: string
  region: string
  capacity: number
  used: number
  fillRate: number
  manager: { name: string; avatar: string }
  status: "active" | "maintenance"
}

export const KPI_STATS = [
  { label: "Tổng số kho", value: 6, trend: 20, trendLabel: "so với tháng trước", icon: "warehouse" as const },
  { label: "Nhập kho hôm nay", value: 18, trend: 12, trendLabel: "so với hôm qua", icon: "inbound" as const },
  { label: "Xuất kho hôm nay", value: 27, trend: 15, trendLabel: "so với hôm qua", icon: "outbound" as const },
  { label: "Yêu cầu chuyển kho", value: 9, trend: 8, trendLabel: "so với hôm qua", icon: "transfer" as const },
]

export const DEFAULT_WAREHOUSE_ROWS: WarehouseRow[] = [
  {
    id: "1",
    code: "WH-HN-01",
    name: "Kho Hà Nội Trung tâm",
    region: "Hà Nội",
    capacity: 5200,
    used: 4680,
    fillRate: 90,
    manager: { name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/64?u=wh1" },
    status: "active",
  },
  {
    id: "2",
    code: "WH-HP-01",
    name: "Kho Hải Phòng",
    region: "Hải Phòng",
    capacity: 2800,
    used: 1960,
    fillRate: 70,
    manager: { name: "Trần Thị Mai", avatar: "https://i.pravatar.cc/64?u=wh2" },
    status: "active",
  },
  {
    id: "3",
    code: "WH-DN-01",
    name: "Kho Đà Nẵng",
    region: "Đà Nẵng",
    capacity: 3600,
    used: 3240,
    fillRate: 90,
    manager: { name: "Lê Hoàng Nam", avatar: "https://i.pravatar.cc/64?u=wh3" },
    status: "active",
  },
  {
    id: "4",
    code: "WH-HCM-01",
    name: "Kho TP.HCM Miền Nam",
    region: "TP. Hồ Chí Minh",
    capacity: 6800,
    used: 6120,
    fillRate: 90,
    manager: { name: "Phạm Minh Tuấn", avatar: "https://i.pravatar.cc/64?u=wh4" },
    status: "active",
  },
  {
    id: "5",
    code: "WH-CT-01",
    name: "Kho Cần Thơ",
    region: "Cần Thơ",
    capacity: 2400,
    used: 1680,
    fillRate: 70,
    manager: { name: "Võ Thị Hương", avatar: "https://i.pravatar.cc/64?u=wh5" },
    status: "maintenance",
  },
  {
    id: "6",
    code: "WH-NT-01",
    name: "Kho Nha Trang",
    region: "Khánh Hòa",
    capacity: 3500,
    used: 2100,
    fillRate: 60,
    manager: { name: "Đặng Quốc Bảo", avatar: "https://i.pravatar.cc/64?u=wh6" },
    status: "active",
  },
]

export const USAGE_BARS = [
  { name: "Kho TP.HCM Miền Nam", rate: 90 },
  { name: "Kho Hà Nội Trung tâm", rate: 90 },
  { name: "Kho Đà Nẵng", rate: 90 },
  { name: "Kho Hải Phòng", rate: 70 },
  { name: "Kho Cần Thơ", rate: 70 },
  { name: "Kho Nha Trang", rate: 60 },
]

export const REGION_MARKERS = [
  { city: "Hà Nội", count: 2, x: 52, y: 18 },
  { city: "Hải Phòng", count: 1, x: 58, y: 22 },
  { city: "Đà Nẵng", count: 1, x: 54, y: 42 },
  { city: "TP.HCM", count: 1, x: 48, y: 72 },
  { city: "Cần Thơ", count: 1, x: 44, y: 78 },
  { city: "Nha Trang", count: 1, x: 52, y: 58 },
]

export const RECENT_ACTIVITIES = [
  {
    type: "in" as const,
    title: "Nhập kho",
    ref: "PN-2024-1842",
    detail: "Kho HCM — 320 sản phẩm",
    time: "14:32, Hôm nay",
  },
  {
    type: "out" as const,
    title: "Xuất kho",
    ref: "PX-2024-0911",
    detail: "Kho HN — Đơn #ORD-3921",
    time: "13:15, Hôm nay",
  },
  {
    type: "check" as const,
    title: "Kiểm kê",
    ref: "KK-2024-044",
    detail: "Kho Đà Nẵng — Hoàn tất",
    time: "11:40, Hôm nay",
  },
  {
    type: "transfer" as const,
    title: "Chuyển kho",
    ref: "CK-2024-028",
    detail: "HN → HCM — 45 thùng",
    time: "09:20, Hôm nay",
  },
  {
    type: "in" as const,
    title: "Nhập kho",
    ref: "PN-2024-1838",
    detail: "Kho Hải Phòng — 120 sp",
    time: "17:05, Hôm qua",
  },
]

const REGIONS = ["Hà Nội", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ", "Khánh Hòa"]
const MANAGERS = [
  { name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/64?u=m1" },
  { name: "Trần Thị Mai", avatar: "https://i.pravatar.cc/64?u=m2" },
  { name: "Lê Hoàng Nam", avatar: "https://i.pravatar.cc/64?u=m3" },
  { name: "Phạm Minh Tuấn", avatar: "https://i.pravatar.cc/64?u=m4" },
]

export function enrichWarehouseFromApi(
  id: number,
  name: string,
  address?: string | null,
  isActive?: boolean,
): WarehouseRow {
  const idx = id % REGIONS.length
  const capacity = 2000 + (id % 5) * 800
  const fillRate = 55 + (id % 4) * 12
  const used = Math.round((capacity * fillRate) / 100)
  const regionFromAddress = address?.split(",").pop()?.trim()
  return {
    id: String(id),
    code: `WH-${String(id).padStart(3, "0")}`,
    name,
    region: regionFromAddress || REGIONS[idx],
    capacity,
    used,
    fillRate,
    manager: MANAGERS[idx % MANAGERS.length],
    status: isActive === false ? "maintenance" : id % 5 === 0 ? "maintenance" : "active",
  }
}
