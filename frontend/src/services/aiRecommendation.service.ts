import aiAxios from "@/lib/aiAxios"
import type {
  AiRecommendationResponse,
  RecommendationQuery,
} from "@/types/ai-recommendation"

const RECOMMENDATION_TITLES: Record<RecommendationQuery["sectionType"], string> = {
  PERSONALIZED: "Sản phẩm được cá nhân hóa theo hành vi người dùng",
  TRENDING: "Sản phẩm đang được nhiều khách quan tâm",
  SIMILAR: "Sản phẩm tương tự với sản phẩm đang xem",
  ALSO_VIEWED: "Khách cũng quan tâm các sản phẩm này",
}

const normalizeLimit = (limit?: number) => {
  if (!limit || Number.isNaN(limit)) return 8

  return Math.min(Math.max(limit, 1), 20)
}

const createEmptyRecommendationResponse = (
  query: RecommendationQuery,
  message?: string,
): AiRecommendationResponse => ({
  type: query.sectionType,
  message:
    message ??
    RECOMMENDATION_TITLES[query.sectionType] ??
    "Chưa có dữ liệu gợi ý phù hợp.",
  user_id: query.userId ?? null,
  product_id: query.productId ?? null,
  count: 0,
  items: [],
})

const hasValidItems = (data?: AiRecommendationResponse | null) => {
  return Boolean(data && Array.isArray(data.items) && data.items.length > 0)
}

const normalizeRecommendationResponse = (
  data: AiRecommendationResponse,
  query: RecommendationQuery,
  sectionType: RecommendationQuery["sectionType"] = query.sectionType,
): AiRecommendationResponse => {
  const items = Array.isArray(data.items) ? data.items : []

  return {
    ...data,
    type: sectionType,
    message:
      data.message ||
      RECOMMENDATION_TITLES[sectionType] ||
      "Sản phẩm gợi ý",
    user_id: data.user_id ?? query.userId ?? null,
    product_id: data.product_id ?? query.productId ?? null,
    count: items.length,
    items,
  }
}

export const aiRecommendationService = {
  async getRecommendations(
    query: RecommendationQuery,
  ): Promise<AiRecommendationResponse> {
    const limit = normalizeLimit(query.limit)

    try {
      switch (query.sectionType) {
        case "PERSONALIZED": {
          /*
           * Không fallback mock data cho personalized.
           * Nếu chưa có userId/lịch sử người dùng thật thì trả rỗng.
           * Tránh hiển thị sản phẩm không tồn tại trong database.
           */
          if (!query.userId) {
            return createEmptyRecommendationResponse(
              query,
              "Cần đăng nhập để cá nhân hóa gợi ý sản phẩm.",
            )
          }

          const { data } = await aiAxios.get<AiRecommendationResponse>(
            `/ai/recommendations/user/${query.userId}`,
            {
              params: { limit },
            },
          )

          if (!hasValidItems(data)) {
            return createEmptyRecommendationResponse(query)
          }

          return normalizeRecommendationResponse(data, query)
        }

        case "TRENDING": {
          /*
           * Section đang dùng cho trang chủ.
           * Chỉ lấy dữ liệu thật từ AI service/backend.
           * Không dùng mock/fake product.
           */
          const { data } = await aiAxios.get<AiRecommendationResponse>(
            "/ai/recommendations/trending",
            {
              params: {
                limit,
                days: 30,
              },
            },
          )

          if (!hasValidItems(data)) {
            return createEmptyRecommendationResponse(
              query,
              "Chưa có sản phẩm đang hot ở thời điểm hiện tại.",
            )
          }

          return normalizeRecommendationResponse(data, query)
        }

        case "SIMILAR": {
          if (!query.productId) {
            return createEmptyRecommendationResponse(
              query,
              "Không có sản phẩm gốc để lấy gợi ý tương tự.",
            )
          }

          const { data } = await aiAxios.get<AiRecommendationResponse>(
            `/ai/recommendations/similar/${query.productId}`,
            {
              params: { limit },
            },
          )

          if (!hasValidItems(data)) {
            return createEmptyRecommendationResponse(query)
          }

          return normalizeRecommendationResponse(data, query)
        }

        case "ALSO_VIEWED": {
          /*
           * Nếu có productId thì ưu tiên similar thật.
           * Nếu không có hoặc similar rỗng thì fallback về trending thật.
           * Tuyệt đối không fallback mock.
           */
          if (query.productId) {
            const { data } = await aiAxios.get<AiRecommendationResponse>(
              `/ai/recommendations/similar/${query.productId}`,
              {
                params: { limit },
              },
            )

            if (hasValidItems(data)) {
              return normalizeRecommendationResponse(data, query, "ALSO_VIEWED")
            }
          }

          const { data } = await aiAxios.get<AiRecommendationResponse>(
            "/ai/recommendations/trending",
            {
              params: {
                limit,
                days: 30,
              },
            },
          )

          if (!hasValidItems(data)) {
            return createEmptyRecommendationResponse(query)
          }

          return normalizeRecommendationResponse(data, query, "ALSO_VIEWED")
        }

        default:
          return createEmptyRecommendationResponse(query)
      }
    } catch (error) {
      console.warn("[aiRecommendationService] Failed to load recommendations:", error)

      return createEmptyRecommendationResponse(
        query,
        "Chưa thể tải gợi ý sản phẩm ở thời điểm hiện tại.",
      )
    }
  },
}