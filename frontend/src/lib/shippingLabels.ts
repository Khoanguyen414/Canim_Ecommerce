import type { ShippingStatus } from "@/types/api.types"

export const SHIPPING_STATUS_VI: Record<ShippingStatus, string> = {
  NOT_SHIPPED: "Chưa giao",
  WAITING_PICKUP: "Chờ lấy hàng",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  FAILED: "Giao thất bại",
  RETURNED: "Đã hoàn hàng",
  CANCELLED: "Đã hủy",
}
