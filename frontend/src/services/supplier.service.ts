import api from "@/utils/axios"
import type { ApiResponse, Supplier } from "@/types/api.types"

export const supplierService = {
  getAll: () => api.get<ApiResponse<Supplier[]>>("/suppliers"),
}
