import { useMemo, useRef, useState } from "react"
import { ChevronDown, Loader2, Ruler, Send, ShoppingBag, Sparkles, PackageSearch } from "lucide-react"

import mascotIcon from "@/assets/brand/canim-ai-mascot.png"
import { aiChatService } from "@/services/aiChat.service"
import type { AiChatMessage, AiProductSuggestion } from "@/types/ai-chat"
import { formatVnd, toNumber } from "@/lib/format"
import "./CanimAiChatWidget.css"

const AI_CHAT_MOCK =
  import.meta.env.VITE_AI_CHAT_MOCK === "true" ||
  import.meta.env.VITE_AI_CHAT_MOCK === undefined

const quickActions = [
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

const demoProducts: AiProductSuggestion[] = [
  {
    product_id: 1,
    variant_id: 11,
    name: "Blazer linen thanh lịch",
    color: "Be",
    size: "M",
    price: 799000,
    image_url:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=500&q=80",
    score: 8,
  },
  {
    product_id: 2,
    variant_id: 12,
    name: "Áo sơ mi lụa cổ V",
    color: "Kem",
    size: "S",
    price: 499000,
    image_url:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=500&q=80",
    score: 7,
  },
  {
    product_id: 3,
    variant_id: 13,
    name: "Quần ống suông basic",
    color: "Be",
    size: "M",
    price: 599000,
    image_url:
      "https://images.unsplash.com/photo-1506629905607-d9f297d4f5f7?auto=format&fit=crop&w=500&q=80",
    score: 6,
  },
]

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

function createMockAssistantMessage(userMessage: string): AiChatMessage {
  const normalized = userMessage.toLowerCase()

  if (normalized.includes("size") || normalized.includes("cao") || normalized.includes("nặng")) {
    return {
      id: createId("assistant"),
      role: "assistant",
      content:
        "Dạ để tư vấn size chuẩn hơn, Anh/Chị cho em thêm giới tính, chiều cao, cân nặng và form muốn mặc nha. Ví dụ: cao 170cm, nặng 60kg, thích mặc vừa hay oversize.",
      intent: "SIZE_SUGGESTION",
      emotion: "NEUTRAL",
      products: [],
      shouldHandoff: false,
    }
  }

  if (normalized.includes("đơn hàng") || normalized.includes("theo dõi")) {
    return {
      id: createId("assistant"),
      role: "assistant",
      content:
        "Dạ Anh/Chị cho em xin mã đơn hàng, ví dụ ORD-1234, để em hỗ trợ kiểm tra trạng thái đơn nhanh hơn ạ.",
      intent: "ORDER_TRACKING",
      emotion: "NEUTRAL",
      products: [],
      shouldHandoff: false,
    }
  }

  if (normalized.includes("tức") || normalized.includes("bực") || normalized.includes("giao sai")) {
    return {
      id: createId("assistant"),
      role: "assistant",
      content:
        "Dạ em xin lỗi Anh/Chị vì trải nghiệm chưa đúng mong muốn ạ. Em sẽ ghi nhận và chuyển nhân viên hỗ trợ kiểm tra kỹ hơn cho mình.",
      intent: "COMPLAINT",
      emotion: "ANGRY",
      products: [],
      shouldHandoff: true,
      handoffReason: "Khách có cảm xúc tức giận, cần nhân viên hỗ trợ kiểm tra.",
    }
  }

  return {
    id: createId("assistant"),
    role: "assistant",
    content:
      "Dạ đây là một vài gợi ý phù hợp với nhu cầu của Anh/Chị nè ✨ Anh/Chị muốn em lọc thêm theo màu, size hoặc khoảng giá không ạ?",
    intent: normalized.includes("outfit") || normalized.includes("phối")
      ? "OUTFIT_SUGGESTION"
      : "PRODUCT_RECOMMENDATION",
    emotion: "NEUTRAL",
    products: demoProducts,
    shouldHandoff: false,
  }
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
        <p className="canim-ai-product-name">{product.name ?? "Sản phẩm gợi ý"}</p>

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

export default function CanimAiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const sessionId = useMemo(() => createSessionId(), [])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào, mình là trợ lý Canim ✨ Mình có thể giúp bạn tìm sản phẩm, gợi ý outfit, tư vấn size và theo dõi đơn hàng.",
      intent: "GREETING",
      emotion: "FRIENDLY",
      products: [],
      shouldHandoff: false,
    },
  ])

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current

      if (!current) {
        window.setTimeout(() => inputRef.current?.focus(), 220)
      }

      return next
    })
  }

  const sendMessage = async (messageText?: string) => {
    const content = (messageText ?? input).trim()

    if (!content || sending) return

    const userMessage: AiChatMessage = {
      id: createId("user"),
      role: "user",
      content,
    }

    setMessages((current) => [...current, userMessage])
    setInput("")
    setSending(true)

    try {
      if (AI_CHAT_MOCK) {
        await new Promise((resolve) => window.setTimeout(resolve, 650))
        setMessages((current) => [...current, createMockAssistantMessage(content)])
        return
      }

      const response = await aiChatService.sendMessage({
        session_id: sessionId,
        message: content,
      })

      const data = response.data

      const assistantMessage: AiChatMessage = {
        id: createId("assistant"),
        role: "assistant",
        content: data.reply,
        intent: data.intent,
        emotion: data.emotion,
        products: data.recommended_products,
        shouldHandoff: data.should_handoff,
        handoffReason: data.handoff_reason,
      }

      setMessages((current) => [...current, assistantMessage])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId("assistant"),
          role: "assistant",
          content:
            "Dạ hiện tại Canim AI đang kết nối chưa ổn định. Anh/Chị thử lại sau ít phút hoặc nhắn nhu cầu cụ thể để shop hỗ trợ nha.",
          intent: "UNKNOWN",
          emotion: "CONFUSED",
          products: [],
          shouldHandoff: true,
          handoffReason: "AI service connection error.",
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
              <div key={message.id} className={`canim-ai-message-row ${message.role}`}>
                {message.role === "assistant" ? (
                  <img className="canim-ai-bot-avatar" src={mascotIcon} alt="" />
                ) : null}

                <div className="canim-ai-message-stack">
                  <div className={`canim-ai-bubble ${message.role}`}>{message.content}</div>

                  {message.shouldHandoff ? (
                    <div className="canim-ai-handoff">
                      Nhân viên Canim nên hỗ trợ thêm: {message.handoffReason ?? "khách cần hỗ trợ trực tiếp."}
                    </div>
                  ) : null}

                  {message.products && message.products.length > 0 ? (
                    <div className="canim-ai-products">
                      {message.products.map((product, index) => (
                        <ProductCard
                          key={`${product.product_id ?? "product"}_${product.variant_id ?? index}`}
                          product={product}
                        />
                      ))}
                    </div>
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
          </div>

          <div className="canim-ai-quick-actions">
            {quickActions.map((action) => {
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
            <button type="submit" disabled={sending || !input.trim()} aria-label="Gửi tin nhắn">
              <Send size={22} />
            </button>
          </form>

          <p className="canim-ai-disclaimer">
            ✨ Canim AI có thể mắc sai sót. Hãy kiểm tra thông tin quan trọng nhé. ✨
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