export type AiIntent =
  | "GREETING" // Chào hỏi
  | "PRODUCT_RECOMMENDATION" // Gợi ý sản phẩm
  | "OUTFIT_SUGGESTION" // Gợi ý phối đồ
  | "SIZE_SUGGESTION" // Tư vấn size
  | "ORDER_TRACKING" // Theo dõi đơn hàng
  | "PROMOTION" // Khuyến mãi
  | "SHIPPING_POLICY" // Chính sách giao hàng
  | "RETURN_POLICY" // Chính sách đổi trả
  | "COMPLAINT" // Phàn nàn
  | "THANKS" // Cảm ơn
  | "SMALL_TALK" // Nói chuyện nhẹ
  | "SECURITY_BLOCK" // Chặn bảo mật
  | "UNKNOWN" // Không xác định

export type AiEmotion =
  | "FRIENDLY" // Thân thiện
  | "NEUTRAL" // Bình thường
  | "HAPPY" // Vui vẻ
  | "THANKS" // Biết ơn / cảm ơn
  | "CONFUSED" // Bối rối
  | "COMPLAINT" // Đang phàn nàn
  | "ANGRY" // Tức giận

export type AiWidgetType =
  | "TEXT_ONLY" // Chỉ hiện tin nhắn chữ
  | "PRODUCT_CAROUSEL" // Hiện carousel sản phẩm
  | "SIZE_ADVICE" // Hiện khung tư vấn size
  | "ORDER_LOOKUP" // Hiện khung kiểm tra đơn hàng
  | "HUMAN_HANDOFF" // Chuyển nhân viên thật

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

  widgetType: AiWidgetType

  entities: Record<string, unknown>
  recommended_products: AiProductSuggestion[]
  quickReplies: string[]

  should_handoff: boolean
  handoff_reason?: string | null

  debugReason?: string | null
}

export type AiChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string

  intent?: AiIntent
  emotion?: AiEmotion
  widgetType?: AiWidgetType

  entities?: Record<string, unknown>
  products?: AiProductSuggestion[]
  quickReplies?: string[]

  shouldHandoff?: boolean
  handoffReason?: string | null
}