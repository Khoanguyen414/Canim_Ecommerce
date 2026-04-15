import api from "@/utils/axios"
import type { ApiResponse, CategoryNode } from "@/types/api.types"

export const categoryService = {
  getRoots: () => api.get<ApiResponse<CategoryNode[]>>("/categories/roots"),

  getAll: () => api.get<ApiResponse<CategoryNode[]>>("/categories"),
}
