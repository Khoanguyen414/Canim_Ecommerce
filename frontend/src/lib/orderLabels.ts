import type { OrderStatus, PaymentMethod } from "@/types/api.types"

export const ORDER_STATUS_VI: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
}

export const PAYMENT_METHOD_VI: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "Ví VNPay (cổng merchant)",
  MOMO: "Ví MoMo (cổng merchant)",
  MOMO_QR: "MoMo — quét QR cá nhân",
  VNPAY_QR: "Chuyển khoản QR (VietQR)",
}

/** Thanh toán chuyển khoản QR ngân hàng (VietQR). */
export function isPersonalQrPayment(method: PaymentMethod): boolean {
  return method === "VNPAY_QR"
}

export function isMerchantOnlinePayment(method: PaymentMethod): boolean {
  return method === "VNPAY" || method === "MOMO" || method === "MOMO_QR"
}

export const PAYMENT_STATUS_VI: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING_CONFIRMATION: "Chờ shop xác nhận",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
}

/** Khách đã bấm「Đã chuyển khoản」— chờ admin đối soát. */
export function isPaymentPendingAdminConfirm(status: string): boolean {
  return status === "PENDING_CONFIRMATION"
}

export const PAYMENT_TX_STATUS_VI: Record<string, string> = {
  PENDING: "Đang chờ",
  PAID: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
}

export function shippingAddressFromParts(parts: {
  address: string
  ward: string
  district: string
  city: string
}): string {
  return [parts.address, parts.ward, parts.district, parts.city]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ")
}
