import api from "@/lib/axios"
import type { ApiResponse, StockCheckCreatePayload, StockCheckSummary } from "@/types/api.types"

export const stockCheckService = {
  create: (body: StockCheckCreatePayload) =>
    api.post<ApiResponse<StockCheckSummary>>("/stock-checks", body),

  complete: (id: number) => api.post<ApiResponse<null>>(`/stock-checks/${id}/complete`),
}
