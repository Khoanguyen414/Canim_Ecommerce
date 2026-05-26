import { api } from "@/lib/http"
import type { ApiResponse, Supplier } from "@/types/api"

export type SupplierPayload = {
  code: string
  name: string
  contactPerson?: string
  email: string
  phone: string
  address?: string
}

export const supplierService = {
  getAll() {
    return api.get<ApiResponse<Supplier[]>>("/suppliers")
  },

  create(payload: SupplierPayload) {
    return api.post<ApiResponse<Supplier>>("/suppliers", payload)
  },

  update(id: number, payload: SupplierPayload) {
    return api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload)
  },

  remove(id: number) {
    return api.delete<ApiResponse<void>>(`/suppliers/${id}`)
  },
}
