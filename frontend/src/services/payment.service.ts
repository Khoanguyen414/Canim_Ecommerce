import api from "@/lib/axios"
import type {
  ApiResponse,
  CreatePaymentPayload,
  CreatePaymentResult,
  PaymentCallbackResult,
} from "@/types/api.types"

export const paymentService = {
  createPayment(orderId: number, body: CreatePaymentPayload) {
    return api
      .post<ApiResponse<CreatePaymentResult>>(`/payments/orders/${orderId}/create`, body)
      .then((r) => r.data)
  },

  confirmVnpayReturn(params: Record<string, string>) {
    return api
      .get<ApiResponse<PaymentCallbackResult>>("/payments/vnpay/return", { params })
      .then((r) => r.data)
  },

  confirmMomoReturn(params: Record<string, string>) {
    return api
      .get<ApiResponse<PaymentCallbackResult>>("/payments/momo/return", { params })
      .then((r) => r.data)
  },
}
