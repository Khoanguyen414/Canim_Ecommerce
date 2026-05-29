export type RecommendationSectionType =
  | "PERSONALIZED"
  | "TRENDING"
  | "SIMILAR"
  | "ALSO_VIEWED"

export type AiRecommendedProduct = {
  productId?: number | null
  product_id?: number | null
  variantId?: number | null
  variant_id?: number | null

  name?: string | null
  productName?: string | null
  slug?: string | null
  brand?: string | null
  categoryName?: string | null

  imageUrl?: string | null
  image_url?: string | null
  mainImageUrl?: string | null

  price?: number | string | null
  color?: string | null
  size?: string | null

  recommendationScore?: number | null
  recommendationReasons?: string[] | null
  score?: number | null

  [key: string]: unknown
}

export type AiRecommendationResponse = {
  type: string
  message: string
  user_id?: number | null
  product_id?: number | null
  days?: number
  query?: string
  count: number
  items: AiRecommendedProduct[]
}

export type RecommendationQuery = {
  sectionType: RecommendationSectionType
  userId?: number | null
  productId?: number | null
  query?: string | null
  limit?: number
}