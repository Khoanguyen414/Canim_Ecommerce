import api from "@/lib/axios"
import type {
  ApiResponse,
  CheckoutPayload,
  CreateOrderTrackingEventPayload,
  OrderDetailDto,
  OrderDynamicQrDto,
  OrderSummaryDto,
  OrderTrackingDto,
  PageResponse,
  UpdateOrderLocationPayload,
} from "@/types/api.types"

export const orderService = {
  checkout: (body: CheckoutPayload) =>
    api.post<ApiResponse<OrderDetailDto>>("/orders/checkout", body).then((r) => r.data),

  getMyOrders: (pageNum = 1, sizePage = 20) =>
    api
      .get<ApiResponse<PageResponse<OrderSummaryDto>>>("/orders/my", {
        params: { pageNum, sizePage },
      })
      .then((r) => r.data),

  getMyOrder: (orderId: number) =>
    api.get<ApiResponse<OrderDetailDto>>(`/orders/my/${orderId}`).then((r) => r.data),

  cancelMyOrder: (orderId: number, reason?: string) =>
    api
      .patch<ApiResponse<OrderDetailDto>>(`/orders/my/${orderId}/cancel`, null, {
        params: reason ? { reason } : undefined,
      })
      .then((r) => r.data),

  declareQrTransfer: (orderId: number) =>
    api
      .post<ApiResponse<OrderDetailDto>>(`/orders/my/${orderId}/declare-qr-transfer`)
      .then((r) => r.data),

  getDynamicQr: (orderId: number) =>
    api.get<ApiResponse<OrderDynamicQrDto>>(`/orders/my/${orderId}/dynamic-qr`).then((r) => r.data),

  getMyTracking: (orderId: number) =>
    api.get<ApiResponse<OrderTrackingDto>>(`/orders/my/${orderId}/tracking`).then((r) => r.data),

  getTracking: (orderId: number) =>
    api.get<ApiResponse<OrderTrackingDto>>(`/orders/${orderId}/tracking`).then((r) => r.data),

  updateLocation: (orderId: number, body: UpdateOrderLocationPayload) =>
    api
      .patch<ApiResponse<unknown>>(`/orders/${orderId}/location`, body)
      .then((r) => r.data),

  createTrackingEvent: (orderId: number, body: CreateOrderTrackingEventPayload) =>
    api
      .post<ApiResponse<unknown>>(`/orders/${orderId}/tracking-events`, body)
      .then((r) => r.data),
}
