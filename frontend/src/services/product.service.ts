import api from "@/utils/axios"
import type { ApiResponse, PageResponse, ProductDetail } from "@/types/api.types"

export interface PublicProductParams {
  pageNum?: number
  sizePage?: number
  keyWord?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
}

export const productService = {
  getPublicPage: (params: PublicProductParams) =>
    api.get<ApiResponse<PageResponse<ProductDetail>>>("/products/public", { params }),

  getById: (id: number) => api.get<ApiResponse<ProductDetail>>(`/products/${id}`),

  getBySlug: (slug: string) => api.get<ApiResponse<ProductDetail>>(`/products/slug/${slug}`),
}
