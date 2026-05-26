import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartLine {
  lineId: string
  productId: number
  variantId: number
  productName: string
  sku: string
  color?: string | null
  size?: string | null
  price: number
  quantity: number
  imageUrl?: string
}

interface CartState {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, "lineId"> & { lineId?: string }) => void
  removeLine: (lineId: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  clear: () => void
  subtotal: () => number
  totalItems: () => number
}

function buildLineId(productId: number, variantId: number) {
  return `${productId}-${variantId}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addLine: (line) => {
        const lineId = line.lineId ?? buildLineId(line.productId, line.variantId)
        set((state) => {
          const existing = state.lines.find((l) => l.lineId === lineId)
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.lineId === lineId ? { ...l, quantity: l.quantity + line.quantity } : l,
              ),
            }
          }
          return { lines: [...state.lines, { ...line, lineId }] }
        })
      },

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      setQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeLine(lineId)
          return
        }
        set((state) => ({
          lines: state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
        }))
      },

      clear: () => set({ lines: [] }),

      subtotal: () => get().lines.reduce((s, l) => s + l.price * l.quantity, 0),

      totalItems: () => get().lines.reduce((s, l) => s + l.quantity, 0),
    }),
    {
      name: "canim-cart-v1",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)
