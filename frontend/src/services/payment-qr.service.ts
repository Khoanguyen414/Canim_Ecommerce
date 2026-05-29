import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { PersonalQrConfigDto } from "@/types/api.types"

export const paymentQrService = {
  getConfig: () =>
    api.get<ApiResponse<PersonalQrConfigDto>>("/payments/personal-qr/config").then((r) => r.data),
}
