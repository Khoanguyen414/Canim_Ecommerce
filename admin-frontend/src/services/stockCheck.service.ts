import { api } from "@/lib/http"
import type { ApiResponse, StockCheckCreatePayload, StockCheckSummary } from "@/types/api"

export const stockCheckService = {
  create(payload: StockCheckCreatePayload) {
    return api.post<ApiResponse<StockCheckSummary>>("/stock-checks", payload)
  },

  complete(id: number) {
    return api.post<ApiResponse<null>>(`/stock-checks/${id}/complete`)
  },
}
