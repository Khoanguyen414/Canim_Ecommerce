import api from "@/lib/axios"
import type { ApiResponse, Supplier } from "@/types/api.types"

export const supplierService = {
  getAll: () => api.get<ApiResponse<Supplier[]>>("/suppliers"),
}
