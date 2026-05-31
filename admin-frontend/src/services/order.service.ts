import { api } from "@/lib/http"
import type {
  ApiResponse,
  OrderDetailRecord,
  OrderStatus,
  OrderSummaryRecord,
  OrderTrackingRecord,
  PagedResult,
  PaymentStatus,
} from "@/types/api"

export type OrderListParams = {
  pageNum?: number
  sizePage?: number
  keywords?: string
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
}

export const orderService = {
  getOrders: (params: OrderListParams = {}) =>
    api
      .get<ApiResponse<PagedResult<OrderSummaryRecord>>>("/orders", { params })
      .then((r) => r.data),

  getOrder: (orderId: number) =>
    api.get<ApiResponse<OrderDetailRecord>>(`/orders/${orderId}`).then((r) => r.data),

  updateStatus: (orderId: number, orderStatus: OrderStatus, reason?: string) =>
    api
      .patch<ApiResponse<OrderDetailRecord>>(`/orders/${orderId}/status`, {
        orderStatus,
        reason,
      })
      .then((r) => r.data),

  confirmQrPayment: (orderId: number) =>
    api
      .patch<ApiResponse<OrderDetailRecord>>(`/orders/${orderId}/confirm-qr-payment`)
      .then((r) => r.data),

  rejectQrPayment: (orderId: number) =>
    api
      .patch<ApiResponse<OrderDetailRecord>>(`/orders/${orderId}/reject-qr-payment`)
      .then((r) => r.data),

  getTracking: (orderId: number) =>
    api.get<ApiResponse<OrderTrackingRecord>>(`/orders/${orderId}/tracking`).then((r) => r.data),

  updateLocation: (
    orderId: number,
    body: { receiverLatitude: number; receiverLongitude: number; locationLabel?: string },
  ) => api.patch<ApiResponse<unknown>>(`/orders/${orderId}/location`, body).then((r) => r.data),

  createTrackingEvent: (
    orderId: number,
    body: {
      shippingStatus: string
      latitude?: number
      longitude?: number
      locationLabel?: string
      note?: string
    },
  ) =>
    api.post<ApiResponse<unknown>>(`/orders/${orderId}/tracking-events`, body).then((r) => r.data),
}
