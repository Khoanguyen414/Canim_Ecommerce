import api from "@/lib/axios"
import type {
  ApiResponse,
  CreateReviewPayload,
  PageResponse,
  ProductReviewDto,
  ReviewSummaryDto,
  UpdateReviewPayload,
} from "@/types/api.types"

export const reviewService = {
  getSummary: (productId: number) =>
    api
      .get<ApiResponse<ReviewSummaryDto>>(`/products/${productId}/reviews/summary`)
      .then((r) => r.data),

  list: (productId: number, pageNum = 1, sizePage = 10) =>
    api
      .get<ApiResponse<PageResponse<ProductReviewDto>>>(`/products/${productId}/reviews`, {
        params: { pageNum, sizePage },
      })
      .then((r) => r.data),

  create: (productId: number, body: CreateReviewPayload) =>
    api
      .post<ApiResponse<ProductReviewDto>>(`/products/${productId}/reviews`, body)
      .then((r) => r.data),

  update: (reviewId: number, body: UpdateReviewPayload) =>
    api.put<ApiResponse<ProductReviewDto>>(`/reviews/${reviewId}`, body).then((r) => r.data),

  remove: (reviewId: number) =>
    api.delete<ApiResponse<null>>(`/reviews/${reviewId}`).then((r) => r.data),
}
