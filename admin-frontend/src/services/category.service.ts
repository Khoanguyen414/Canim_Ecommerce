import { api } from "@/lib/http"
import type { ApiResponse, Category } from "@/types/api"

export type CategoryPayload = {
  name: string
  description?: string
  parentId?: number | null
}

export const categoryService = {
  getAll() {
    return api.get<ApiResponse<Category[]>>("/categories")
  },

  create(payload: CategoryPayload) {
    return api.post<ApiResponse<Category>>("/categories", payload)
  },

  update(id: number, payload: CategoryPayload) {
    return api.put<ApiResponse<Category>>(`/categories/${id}`, payload)
  },

  remove(id: number) {
    return api.delete<ApiResponse<void>>(`/categories/${id}`)
  },
}
