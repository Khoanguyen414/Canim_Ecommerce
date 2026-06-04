import aiAxios from "@/lib/aiAxios"
import type {
  AiRecommendationResponse,
  RecommendationQuery,
} from "@/types/ai-recommendation"

const titleByType: Record<string, string> = {
  PERSONALIZED: "Sản phẩm được cá nhân hóa theo hành vi người dùng",
  TRENDING: "Sản phẩm đang được nhiều khách quan tâm",
  SIMILAR: "Sản phẩm tương tự với sản phẩm đang xem",
  ALSO_VIEWED: "Khách cũng quan tâm các sản phẩm này",
}

const normalizeLimit = (limit?: number) => {
  if (!limit) return 8

  return Math.min(Math.max(limit, 1), 20)
}

const createEmptyResponse = (
  query: RecommendationQuery,
  message?: string,
): AiRecommendationResponse => {
  return {
    type: query.sectionType,
    message: message ?? titleByType[query.sectionType] ?? "Sản phẩm gợi ý",
    user_id: query.userId ?? null,
    product_id: query.productId ?? null,
    count: 0,
    items: [],
  }
}

const isEmptyRecommendation = (data?: AiRecommendationResponse | null) => {
  return !data || !Array.isArray(data.items) || data.items.length === 0
}

const normalizeRecommendationResponse = (
  data: AiRecommendationResponse,
  query: RecommendationQuery,
  overrideType?: RecommendationQuery["sectionType"],
): AiRecommendationResponse => {
  const type = overrideType ?? query.sectionType

  return {
    ...data,
    type,
    message: data.message || titleByType[type] || "Sản phẩm gợi ý",
    user_id: data.user_id ?? query.userId ?? null,
    product_id: data.product_id ?? query.productId ?? null,
    count: Array.isArray(data.items) ? data.items.length : 0,
    items: Array.isArray(data.items) ? data.items : [],
  }
}

export const aiRecommendationService = {
  async getRecommendations(
    query: RecommendationQuery,
  ): Promise<AiRecommendationResponse> {
    const limit = normalizeLimit(query.limit)

    try {
      if (query.sectionType === "PERSONALIZED") {
        if (!query.userId) {
          return createEmptyResponse(
            query,
            "Cần đăng nhập để cá nhân hóa gợi ý sản phẩm.",
          )
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          `/ai/recommendations/user/${query.userId}`,
          { params: { limit } },
        )

        return isEmptyRecommendation(data)
          ? createEmptyResponse(query)
          : normalizeRecommendationResponse(data, query)
      }

      if (query.sectionType === "TRENDING") {
        const { data } = await aiAxios.get<AiRecommendationResponse>(
          "/ai/recommendations/trending",
          { params: { limit, days: 30 } },
        )

        return isEmptyRecommendation(data)
          ? createEmptyResponse(query)
          : normalizeRecommendationResponse(data, query)
      }

      if (query.sectionType === "SIMILAR") {
        if (!query.productId) {
          return createEmptyResponse(
            query,
            "Không có sản phẩm gốc để lấy gợi ý tương tự.",
          )
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          `/ai/recommendations/similar/${query.productId}`,
          { params: { limit } },
        )

        return isEmptyRecommendation(data)
          ? createEmptyResponse(query)
          : normalizeRecommendationResponse(data, query)
      }

      if (query.sectionType === "ALSO_VIEWED") {
        if (query.productId) {
          const { data } = await aiAxios.get<AiRecommendationResponse>(
            `/ai/recommendations/similar/${query.productId}`,
            { params: { limit } },
          )

          if (!isEmptyRecommendation(data)) {
            return normalizeRecommendationResponse(data, query, "ALSO_VIEWED")
          }
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          "/ai/recommendations/trending",
          { params: { limit, days: 30 } },
        )

        return isEmptyRecommendation(data)
          ? createEmptyResponse(query)
          : normalizeRecommendationResponse(data, query, "ALSO_VIEWED")
      }

      return createEmptyResponse(query)
    } catch (error) {
      console.warn("[aiRecommendationService] Failed to load recommendations:", error)

      return createEmptyResponse(
        query,
        "Chưa thể tải gợi ý sản phẩm ở thời điểm hiện tại.",
      )
    }
  },
}