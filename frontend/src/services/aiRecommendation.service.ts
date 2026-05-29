import aiAxios from "@/lib/aiAxios"
import type {
  AiRecommendationResponse,
  AiRecommendedProduct,
  RecommendationQuery,
} from "@/types/ai-recommendation"

const personalizedMockProducts: AiRecommendedProduct[] = [
  {
    productId: 101,
    variantId: 1001,
    name: "Đầm denim thanh lịch",
    brand: "Canim",
    categoryName: "Đầm",
    color: "Xanh denim",
    size: "M",
    price: 799000,
    imageUrl:
      "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 9.2,
    recommendationReasons: [
      "Phù hợp gu thời trang bạn thường quan tâm",
      "Dễ phối đi chơi hoặc đi làm",
    ],
  },
  {
    productId: 102,
    variantId: 1002,
    name: "Áo sơ mi phối cà vạt",
    brand: "Canim",
    categoryName: "Áo sơ mi",
    color: "Trắng",
    size: "L",
    price: 499000,
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.5,
    recommendationReasons: [
      "Dễ phối outfit đi làm, đi học",
      "Phù hợp phong cách thanh lịch",
    ],
  },
  {
    productId: 103,
    variantId: 1003,
    name: "Quần jean ống suông basic",
    brand: "Canim",
    categoryName: "Quần jean",
    color: "Xanh",
    size: "L",
    price: 599000,
    imageUrl:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.1,
    recommendationReasons: [
      "Sản phẩm basic dễ phối nhiều outfit",
      "Phù hợp nhiều dáng người",
    ],
  },
  {
    productId: 104,
    variantId: 1004,
    name: "Đầm maxi họa tiết",
    brand: "Canim",
    categoryName: "Đầm",
    color: "Trắng",
    size: "M",
    price: 699000,
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 7.8,
    recommendationReasons: [
      "Phù hợp đi chơi, du lịch, cà phê",
      "Phong cách nữ tính, nhẹ nhàng",
    ],
  },
]

const trendingMockProducts: AiRecommendedProduct[] = [
  {
    productId: 201,
    variantId: 2001,
    name: "Blazer linen cao cấp",
    brand: "Canim",
    categoryName: "Áo khoác",
    color: "Be",
    size: "M",
    price: 899000,
    imageUrl:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 9.5,
    recommendationReasons: [
      "Đang được nhiều khách thêm vào giỏ",
      "Xu hướng outfit thanh lịch tuần này",
    ],
  },
  {
    productId: 202,
    variantId: 2002,
    name: "Áo thun oversize basic",
    brand: "Canim",
    categoryName: "Áo thun",
    color: "Đen",
    size: "XL",
    price: 299000,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.9,
    recommendationReasons: [
      "Sản phẩm hot trong tuần",
      "Dễ phối với quần jean, quần kaki",
    ],
  },
  {
    productId: 203,
    variantId: 2003,
    name: "Chân váy xếp ly nữ tính",
    brand: "Canim",
    categoryName: "Chân váy",
    color: "Kem",
    size: "S",
    price: 459000,
    imageUrl:
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d24?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.4,
    recommendationReasons: [
      "Nhiều khách đang quan tâm",
      "Phù hợp phong cách nhẹ nhàng",
    ],
  },
  {
    productId: 204,
    variantId: 2004,
    name: "Áo khoác denim form rộng",
    brand: "Canim",
    categoryName: "Áo khoác",
    color: "Xanh denim",
    size: "L",
    price: 749000,
    imageUrl:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.2,
    recommendationReasons: [
      "Phù hợp xu hướng streetwear",
      "Được nhiều khách xem gần đây",
    ],
  },
]

const similarMockProducts: AiRecommendedProduct[] = [
  {
    productId: 301,
    variantId: 3001,
    name: "Áo khoác kaki dáng ngắn",
    brand: "Canim",
    categoryName: "Áo khoác",
    color: "Nâu",
    size: "M",
    price: 689000,
    imageUrl:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.7,
    recommendationReasons: [
      "Cùng nhóm sản phẩm",
      "Khoảng giá tương tự sản phẩm đang xem",
    ],
  },
  {
    productId: 302,
    variantId: 3002,
    name: "Áo cardigan mềm mại",
    brand: "Canim",
    categoryName: "Áo khoác",
    color: "Kem",
    size: "Freesize",
    price: 549000,
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.1,
    recommendationReasons: [
      "Phong cách dễ phối tương tự",
      "Phù hợp mặc hằng ngày",
    ],
  },
  {
    productId: 303,
    variantId: 3003,
    name: "Áo sơ mi oversize",
    brand: "Canim",
    categoryName: "Áo sơ mi",
    color: "Xanh nhạt",
    size: "L",
    price: 429000,
    imageUrl:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 7.9,
    recommendationReasons: [
      "Có thể phối cùng style",
      "Màu sắc dễ mặc",
    ],
  },
  {
    productId: 304,
    variantId: 3004,
    name: "Quần tây ống suông",
    brand: "Canim",
    categoryName: "Quần tây",
    color: "Đen",
    size: "M",
    price: 589000,
    imageUrl:
      "https://images.unsplash.com/photo-1506629905607-c52b5992ca5b?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 7.5,
    recommendationReasons: [
      "Dễ phối với sản phẩm đang xem",
      "Phù hợp outfit đi làm",
    ],
  },
]

const alsoViewedMockProducts: AiRecommendedProduct[] = [
  {
    productId: 401,
    variantId: 4001,
    name: "Túi mini phối outfit",
    brand: "Canim",
    categoryName: "Phụ kiện",
    color: "Đen",
    size: "Mini",
    price: 359000,
    imageUrl:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.6,
    recommendationReasons: [
      "Khách xem sản phẩm này cũng quan tâm",
      "Phù hợp phối thêm điểm nhấn",
    ],
  },
  {
    productId: 402,
    variantId: 4002,
    name: "Giày sneaker trắng basic",
    brand: "Canim",
    categoryName: "Giày",
    color: "Trắng",
    size: "38",
    price: 799000,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 8.3,
    recommendationReasons: [
      "Dễ phối với nhiều outfit",
      "Được nhiều khách xem cùng",
    ],
  },
  {
    productId: 403,
    variantId: 4003,
    name: "Thắt lưng da tối giản",
    brand: "Canim",
    categoryName: "Phụ kiện",
    color: "Nâu",
    size: "Freesize",
    price: 249000,
    imageUrl:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 7.8,
    recommendationReasons: [
      "Phù hợp hoàn thiện outfit",
      "Khách thường xem cùng sản phẩm thời trang",
    ],
  },
  {
    productId: 404,
    variantId: 4004,
    name: "Áo thun cổ tròn premium",
    brand: "Canim",
    categoryName: "Áo thun",
    color: "Trắng",
    size: "M",
    price: 329000,
    imageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=80",
    recommendationScore: 7.6,
    recommendationReasons: [
      "Sản phẩm nền dễ phối",
      "Nhiều khách chọn để phối layer",
    ],
  },
]

const fallbackProductsByType: Record<string, AiRecommendedProduct[]> = {
  PERSONALIZED: personalizedMockProducts,
  TRENDING: trendingMockProducts,
  SIMILAR: similarMockProducts,
  ALSO_VIEWED: alsoViewedMockProducts,
}

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

const createFallbackResponse = (
  query: RecommendationQuery,
): AiRecommendationResponse => {
  const fallbackItems =
    fallbackProductsByType[query.sectionType] ?? personalizedMockProducts

  const items = fallbackItems.slice(0, normalizeLimit(query.limit))

  return {
    type: query.sectionType,
    message: titleByType[query.sectionType] ?? "Sản phẩm gợi ý",
    user_id: query.userId ?? null,
    product_id: query.productId ?? null,
    count: items.length,
    items,
  }
}

const isEmptyRecommendation = (data: AiRecommendationResponse) => {
  return !Array.isArray(data.items) || data.items.length === 0
}

export const aiRecommendationService = {
  async getRecommendations(
    query: RecommendationQuery,
  ): Promise<AiRecommendationResponse> {
    const limit = normalizeLimit(query.limit)

    try {
      if (query.sectionType === "PERSONALIZED") {
        if (!query.userId) {
          return createFallbackResponse(query)
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          `/ai/recommendations/user/${query.userId}`,
          { params: { limit } },
        )

        return isEmptyRecommendation(data) ? createFallbackResponse(query) : data
      }

      if (query.sectionType === "TRENDING") {
        const { data } = await aiAxios.get<AiRecommendationResponse>(
          "/ai/recommendations/trending",
          { params: { limit, days: 30 } },
        )

        return isEmptyRecommendation(data) ? createFallbackResponse(query) : data
      }

      if (query.sectionType === "SIMILAR") {
        if (!query.productId) {
          return createFallbackResponse(query)
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          `/ai/recommendations/similar/${query.productId}`,
          { params: { limit } },
        )

        return isEmptyRecommendation(data) ? createFallbackResponse(query) : data
      }

      if (query.sectionType === "ALSO_VIEWED") {
        if (query.productId) {
          const { data } = await aiAxios.get<AiRecommendationResponse>(
            `/ai/recommendations/similar/${query.productId}`,
            { params: { limit } },
          )

          if (!isEmptyRecommendation(data)) {
            return {
              ...data,
              type: "ALSO_VIEWED",
              message: titleByType.ALSO_VIEWED,
            }
          }
        }

        const { data } = await aiAxios.get<AiRecommendationResponse>(
          "/ai/recommendations/trending",
          { params: { limit, days: 30 } },
        )

        if (!isEmptyRecommendation(data)) {
          return {
            ...data,
            type: "ALSO_VIEWED",
            message: titleByType.ALSO_VIEWED,
          }
        }

        return createFallbackResponse(query)
      }

      return createFallbackResponse(query)
    } catch {
      return createFallbackResponse(query)
    }
  },
}