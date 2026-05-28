export type AiIntent =
  | "GREETING"
  | "PRODUCT_RECOMMENDATION"
  | "OUTFIT_SUGGESTION"
  | "SIZE_SUGGESTION"
  | "ORDER_TRACKING"
  | "PROMOTION"
  | "SHIPPING_POLICY"
  | "RETURN_POLICY"
  | "COMPLAINT"
  | "THANKS"
  | "SMALL_TALK"
  | "SECURITY_BLOCK"
  | "UNKNOWN"

export type AiEmotion =
  | "FRIENDLY"
  | "NEUTRAL"
  | "HAPPY"
  | "THANKS"
  | "CONFUSED"
  | "COMPLAINT"
  | "ANGRY"

export type AiProductSuggestion = {
  product_id?: number | null
  variant_id?: number | null
  sku?: string | null
  name?: string | null
  slug?: string | null
  brand?: string | null
  category_name?: string | null
  color?: string | null
  size?: string | null
  price?: number | null
  available_quantity?: number | null
  image_url?: string | null
  score?: number | null
}

export type AiChatRequest = {
  session_id: string
  message: string
}

export type AiChatResponse = {
  reply: string
  intent: AiIntent
  emotion: AiEmotion
  recommended_products: AiProductSuggestion[]
  should_handoff: boolean
  handoff_reason?: string | null
}

export type AiChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  intent?: AiIntent
  emotion?: AiEmotion
  products?: AiProductSuggestion[]
  shouldHandoff?: boolean
  handoffReason?: string | null
}