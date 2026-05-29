export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "UNPAID" | "PENDING_CONFIRMATION" | "PAID" | "REFUNDED"
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "MOMO_QR" | "VNPAY_QR"

export const ORDER_STATUS_VI: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
}

export const PAYMENT_STATUS_VI: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING_CONFIRMATION: "Chờ xác nhận CK",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
}

export const PAYMENT_METHOD_VI: Record<PaymentMethod, string> = {
  COD: "COD",
  VNPAY: "VNPay (cổng)",
  MOMO: "MoMo (cổng)",
  MOMO_QR: "MoMo QR",
  VNPAY_QR: "Chuyển khoản QR",
}

export function isPersonalQrPayment(method: PaymentMethod): boolean {
  return method === "VNPAY_QR"
}

export function paymentBadgeVariant(
  status: PaymentStatus,
): "success" | "danger" | "neutral" | "warning" {
  if (status === "PAID") return "success"
  if (status === "PENDING_CONFIRMATION") return "warning"
  if (status === "REFUNDED") return "neutral"
  return "danger"
}

export function orderBadgeVariant(status: OrderStatus): "success" | "danger" | "neutral" | "warning" {
  if (status === "DELIVERED") return "success"
  if (status === "CANCELLED") return "danger"
  if (status === "PENDING") return "warning"
  return "neutral"
}
