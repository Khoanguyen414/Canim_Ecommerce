import { api } from "@/lib/http"
import type { ApiResponse, Warehouse } from "@/types/api"

export type WarehousePayload = {
  name: string
  address?: string
}

export const warehouseService = {
  getAll() {
    return api.get<ApiResponse<Warehouse[]>>("/warehouses")
  },

  create(payload: WarehousePayload) {
    return api.post<ApiResponse<Warehouse>>("/warehouses", payload)
  },

  update(id: number, payload: WarehousePayload) {
    return api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, payload)
  },

  remove(id: number) {
    return api.delete<ApiResponse<void>>(`/warehouses/${id}`)
  },
}
