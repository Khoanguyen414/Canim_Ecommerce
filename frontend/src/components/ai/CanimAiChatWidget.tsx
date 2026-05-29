import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  Loader2,
  PackageSearch,
  Ruler,
  Send,
  ShoppingBag,
  Sparkles,
} from "lucide-react"

import mascotIcon from "@/assets/brand/canim-ai-mascot.png"
import { formatVnd, toNumber } from "@/lib/format"
import { aiChatService } from "@/services/aiChat.service"
import type {
  AiChatMessage,
  AiEmotion,
  AiIntent,
  AiProductSuggestion,
} from "@/types/ai-chat"

import "./CanimAiChatWidget.css"

type CanimWidgetType =
  | "TEXT_ONLY"
  | "PRODUCT_CAROUSEL"
  | "SIZE_ADVICE"
  | "ORDER_LOOKUP"
  | "HUMAN_HANDOFF"

type CanimChatMessage = AiChatMessage & {
  widgetType?: CanimWidgetType
  entities?: Record<string, unknown>
  quickReplies?: string[]
}

type AiChatApiResponse = {
  reply: string
  intent?: string
  emotion?: string
  widgetType?: string
  entities?: Record<string, unknown>
  recommended_products?: AiProductSuggestion[]
  quickReplies?: string[]
  should_handoff?: boolean
  handoff_reason?: string | null
  debugReason?: string | null
}

type AiChatRequest = {
  session_id: string
  message: string
}

const defaultQuickActions = [
  {
    label: "Gợi ý outfit",
    icon: Sparkles,
    prompt: "Mình muốn gợi ý outfit đi làm tone be thanh lịch, nữ tính.",
  },
  {
    label: "Tìm size phù hợp",
    icon: Ruler,
    prompt: "Mình cao 170cm nặng 60kg thì nên mặc size gì?",
  },
  {
    label: "Sản phẩm mới",
    icon: ShoppingBag,
    prompt: "Shop có sản phẩm mới nào phù hợp đi chơi không?",
  },
  {
    label: "Theo dõi đơn hàng",
    icon: PackageSearch,
    prompt: "Mình muốn kiểm tra trạng thái đơn hàng.",
  },
]

const SIZE_GUIDE = [
  {
    size: "S",
    height: "150 - 160cm",
    weight: "45 - 52kg",
  },
  {
    size: "M",
    height: "161 - 170cm",
    weight: "53 - 60kg",
  },
  {
    size: "L",
    height: "171 - 178cm",
    weight: "61 - 68kg",
  },
  {
    size: "XL",
    height: "179 - 185cm",
    weight: "69 - 78kg",
  },
] as const

function createId(prefix = "msg") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function createSessionId() {
  const key = "canim_ai_session_id"
  const existing = window.localStorage.getItem(key)

  if (existing) return existing

  const sessionId = `sk_${Date.now()}_${Math.random().toString(16).slice(2)}`
  window.localStorage.setItem(key, sessionId)

  return sessionId
}

function safeWidgetType(value?: string): CanimWidgetType {
  if (
    value === "TEXT_ONLY" ||
    value === "PRODUCT_CAROUSEL" ||
    value === "SIZE_ADVICE" ||
    value === "ORDER_LOOKUP" ||
    value === "HUMAN_HANDOFF"
  ) {
    return value
  }

  return "TEXT_ONLY"
}

function safeIntent(value?: string): AiIntent {
  if (
    value === "GREETING" ||
    value === "PRODUCT_RECOMMENDATION" ||
    value === "OUTFIT_SUGGESTION" ||
    value === "SIZE_SUGGESTION" ||
    value === "ORDER_TRACKING" ||
    value === "PROMOTION" ||
    value === "SHIPPING_POLICY" ||
    value === "RETURN_POLICY" ||
    value === "COMPLAINT" ||
    value === "THANKS" ||
    value === "SMALL_TALK" ||
    value === "SECURITY_BLOCK" ||
    value === "UNKNOWN"
  ) {
    return value
  }

  return "UNKNOWN"
}

function safeEmotion(value?: string): AiEmotion {
  if (
    value === "FRIENDLY" ||
    value === "NEUTRAL" ||
    value === "HAPPY" ||
    value === "THANKS" ||
    value === "CONFUSED" ||
    value === "COMPLAINT" ||
    value === "ANGRY"
  ) {
    return value
  }

  return "NEUTRAL"
}

function getProductsForWidget(
  widgetType: CanimWidgetType,
  products?: AiProductSuggestion[],
) {
  if (widgetType !== "PRODUCT_CAROUSEL") {
    return []
  }

  return Array.isArray(products) ? products : []
}

function getEntityNumber(
  entities: Record<string, unknown> | undefined,
  key: string,
) {
  const value = entities?.[key]

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)

    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return undefined
}

function getEntityString(
  entities: Record<string, unknown> | undefined,
  key: string,
) {
  const value = entities?.[key]

  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return undefined
}

function ProductCard({ product }: { product: AiProductSuggestion }) {
  const price = toNumber(product.price)

  return (
    <article className="canim-ai-product-card">
      <div className="canim-ai-product-image-wrap">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name ?? "Sản phẩm Canim"} />
        ) : (
          <div className="canim-ai-product-placeholder">Canim</div>
        )}
      </div>

      <div className="canim-ai-product-body">
        <p className="canim-ai-product-name">
          {product.name ?? "Sản phẩm gợi ý"}
        </p>

        <div className="canim-ai-product-meta">
          {product.color ? <span>{product.color}</span> : null}
          {product.size ? <span>Size {product.size}</span> : null}
        </div>

        <div className="canim-ai-product-footer">
          <strong>{price > 0 ? formatVnd(price) : "Liên hệ"}</strong>

          <button type="button" aria-label="Yêu thích sản phẩm">
            ♡
          </button>
        </div>
      </div>
    </article>
  )
}

function SizeAdviceBox({ entities }: { entities?: Record<string, unknown> }) {
  const heightCm = getEntityNumber(entities, "heightCm")
  const weightKg = getEntityNumber(entities, "weightKg")
  const recommendedSize = getEntityString(entities, "recommendedSize")
  const fitNote = getEntityString(entities, "fitNote")

  const hasHeight = typeof heightCm === "number" && heightCm > 0
  const hasWeight = typeof weightKg === "number" && weightKg > 0
  const hasRecommendedSize =
    typeof recommendedSize === "string" &&
    recommendedSize !== "" &&
    recommendedSize !== "UNKNOWN"

  const shouldShowResult = hasHeight || hasWeight || hasRecommendedSize

  return (
    <div className="canim-ai-size-box">
      <div className="canim-ai-size-box-title">
        <Ruler size={16} />
        Tư vấn size Canim
      </div>

      {shouldShowResult ? (
        <div className="canim-ai-size-grid">
          {hasHeight ? (
            <>
              <span>Chiều cao</span>
              <strong>{heightCm}cm</strong>
            </>
          ) : null}

          {hasWeight ? (
            <>
              <span>Cân nặng</span>
              <strong>{weightKg}kg</strong>
            </>
          ) : null}

          {hasRecommendedSize ? (
            <>
              <span>Size gợi ý</span>
              <strong>Size {recommendedSize}</strong>
            </>
          ) : null}
        </div>
      ) : (
        <p className="canim-ai-size-empty">
          Anh/Chị gửi chiều cao và cân nặng, ví dụ: “cao 165cm nặng 65kg”,
          Canim sẽ tính size phù hợp cho mình nha.
        </p>
      )}

      {fitNote ? <p>{fitNote}</p> : null}

      <div className="canim-ai-size-table">
        <div className="canim-ai-size-table-head">
          <span>Size</span>
          <span>Chiều cao</span>
          <span>Cân nặng</span>
        </div>

        {SIZE_GUIDE.map((row) => {
          const active = recommendedSize === row.size

          return (
            <div
              key={row.size}
              className={`canim-ai-size-table-row ${active ? "active" : ""}`}
            >
              <strong>{row.size}</strong>
              <span>{row.height}</span>
              <span>{row.weight}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderLookupBox() {
  return (
    <div className="canim-ai-info-box">
      <strong>Kiểm tra đơn hàng</strong>
      <p>
        Nhập mã đơn dạng ORD-1234 hoặc DH-1234 để Canim hỗ trợ kiểm tra nhanh
        hơn.
      </p>
    </div>
  )
}

function HandoffBox({ reason }: { reason?: string | null }) {
  return (
    <div className="canim-ai-handoff">
      <strong>Canim sẽ ưu tiên nhân viên hỗ trợ.</strong>
      <p>{reason ?? "Khách cần hỗ trợ trực tiếp để xử lý chính xác hơn."}</p>
    </div>
  )
}

function AssistantWidget({ message }: { message: CanimChatMessage }) {
  const widgetType = safeWidgetType(message.widgetType)

  if (widgetType === "PRODUCT_CAROUSEL") {
    const products = getProductsForWidget(widgetType, message.products)

    if (products.length === 0) {
      return (
        <div className="canim-ai-info-box">
          <strong>Chưa có sản phẩm phù hợp</strong>
          <p>
            Canim chưa tìm thấy sản phẩm đúng nhu cầu. Anh/Chị thử mô tả rõ hơn
            về màu, size hoặc khoảng giá nha.
          </p>
        </div>
      )
    }

    return (
      <div className="canim-ai-products">
        {products.map((product, index) => (
          <ProductCard
            key={`${product.product_id ?? "product"}_${
              product.variant_id ?? index
            }`}
            product={product}
          />
        ))}
      </div>
    )
  }

  if (widgetType === "SIZE_ADVICE") {
    return <SizeAdviceBox entities={message.entities} />
  }

  if (widgetType === "ORDER_LOOKUP") {
    return <OrderLookupBox />
  }

  if (widgetType === "HUMAN_HANDOFF") {
    return <HandoffBox reason={message.handoffReason} />
  }

  return null
}

export default function CanimAiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  const sessionId = useMemo(() => createSessionId(), [])

  const inputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [messages, setMessages] = useState<CanimChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào, mình là trợ lý Canim ✨ Mình có thể giúp bạn tìm sản phẩm, gợi ý outfit, tư vấn size và theo dõi đơn hàng.",
      intent: "GREETING",
      emotion: "NEUTRAL",
      widgetType: "TEXT_ONLY",
      products: [],
      entities: {},
      shouldHandoff: false,
      quickReplies: ["Gợi ý outfit", "Tư vấn chọn size", "Kiểm tra đơn hàng"],
    },
  ])

  const lastAssistantQuickReplies = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant")

    if (!lastAssistant?.quickReplies?.length) {
      return null
    }

    return lastAssistant.quickReplies
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, sending, open])

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current

      if (!current) {
        window.setTimeout(() => inputRef.current?.focus(), 220)
      }

      return next
    })
  }

  const buildAssistantMessageFromApi = (
    data: AiChatApiResponse,
  ): CanimChatMessage => {
    const widgetType = safeWidgetType(data.widgetType)

    return {
      id: createId("assistant"),
      role: "assistant",
      content: data.reply,
      intent: safeIntent(data.intent),
      emotion: safeEmotion(data.emotion),
      widgetType,
      entities: data.entities ?? {},
      products: getProductsForWidget(widgetType, data.recommended_products),
      shouldHandoff: Boolean(data.should_handoff),
      handoffReason: data.handoff_reason ?? undefined,
      quickReplies: data.quickReplies ?? [],
    }
  }

  const sendMessage = async (messageText?: string) => {
    const content = (messageText ?? input).trim()

    if (!content || sending) return

    const userMessage: CanimChatMessage = {
      id: createId("user"),
      role: "user",
      content,
      widgetType: "TEXT_ONLY",
      products: [],
      entities: {},
    }

    setMessages((current) => [...current, userMessage])
    setInput("")
    setSending(true)

    try {
      const requestPayload: AiChatRequest = {
        session_id: sessionId,
        message: content,
      }

      const response = await aiChatService.sendMessage(requestPayload)

      setMessages((current) => [
        ...current,
        buildAssistantMessageFromApi(response.data as AiChatApiResponse),
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId("assistant"),
          role: "assistant",
          content:
            "Dạ hiện tại Canim AI chưa kết nối được với máy chủ tư vấn. Anh/Chị thử lại sau ít phút giúp em nha.",
          intent: "UNKNOWN",
          emotion: "NEUTRAL",
          widgetType: "HUMAN_HANDOFF",
          entities: {},
          products: [],
          shouldHandoff: true,
          handoffReason: "AI service connection error.",
          quickReplies: ["Thử lại", "Kết nối nhân viên", "Gọi hotline Canim"],
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  return (
    <div className="canim-ai-widget" aria-live="polite">
      {open ? (
        <section className="canim-ai-panel" aria-label="Canim AI Stylist">
          <header className="canim-ai-header">
            <div className="canim-ai-header-avatar">
              <img src={mascotIcon} alt="Canim AI Stylist" />
            </div>

            <div className="canim-ai-header-copy">
              <h2>Canim AI Stylist</h2>
              <p>
                <span /> Trợ lý thời trang online
              </p>
            </div>

            <button
              type="button"
              className="canim-ai-collapse"
              onClick={toggleOpen}
              aria-label="Thu nhỏ Canim AI"
            >
              <ChevronDown size={24} />
            </button>
          </header>

          <div className="canim-ai-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`canim-ai-message-row ${message.role}`}
              >
                {message.role === "assistant" ? (
                  <img className="canim-ai-bot-avatar" src={mascotIcon} alt="" />
                ) : null}

                <div className="canim-ai-message-stack">
                  <div className={`canim-ai-bubble ${message.role}`}>
                    {message.content}
                  </div>

                  {message.role === "assistant" ? (
                    <AssistantWidget message={message} />
                  ) : null}
                </div>
              </div>
            ))}

            {sending ? (
              <div className="canim-ai-message-row assistant">
                <img className="canim-ai-bot-avatar" src={mascotIcon} alt="" />

                <div className="canim-ai-bubble assistant loading">
                  <Loader2 size={16} className="animate-spin" />
                  Canim AI đang suy nghĩ...
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="canim-ai-quick-actions">
            {lastAssistantQuickReplies?.length
              ? lastAssistantQuickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => void sendMessage(reply)}
                    disabled={sending}
                  >
                    <Sparkles size={18} />
                    {reply}
                  </button>
                ))
              : defaultQuickActions.map((action) => {
                  const Icon = action.icon

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => void sendMessage(action.prompt)}
                      disabled={sending}
                    >
                      <Icon size={18} />
                      {action.label}
                    </button>
                  )
                })}
          </div>

          <form className="canim-ai-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Gửi tin nhắn"
            >
              <Send size={22} />
            </button>
          </form>

          <p className="canim-ai-disclaimer">
            ✨ Canim AI có thể mắc sai sót. Hãy kiểm tra thông tin quan trọng nhé.
            ✨
          </p>
        </section>
      ) : null}

      <button
        type="button"
        className="canim-ai-floating-button"
        onClick={toggleOpen}
        aria-label={open ? "Đóng Canim AI Stylist" : "Mở Canim AI Stylist"}
      >
        <img src={mascotIcon} alt="" />
      </button>
    </div>
  )
}