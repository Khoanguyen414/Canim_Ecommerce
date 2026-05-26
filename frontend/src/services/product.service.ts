import api from "@/lib/axios"
import type { ApiResponse, PageResponse, ProductDetail } from "@/types/api.types"

export interface PublicProductParams {
  pageNum?: number
  sizePage?: number
  keyWord?: string
  categoryId?: number
  gender?: "nam" | "nu"
  group?: "phu-kien" | "ao" | "quan" | "the-thao"
  facet?: string
  collection?: "new" | "sale" | "bestseller" | "promo"
  minPrice?: number
  maxPrice?: number
  sizes?: string
  colors?: string
  sortBy?: string
}

export const productService = {
  getPublicPage: (params: PublicProductParams) =>
    api.get<ApiResponse<PageResponse<ProductDetail>>>("/products/public", { params }),

  getPublicById: (id: number) =>
    api.get<ApiResponse<ProductDetail>>(`/products/public/${id}`),
}
