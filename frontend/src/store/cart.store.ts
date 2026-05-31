import { create } from "zustand"
import { persist } from "zustand/middleware"

import { mapCartItemToLine } from "@/lib/cartMappers"
import { cartService } from "@/services/cart.service"
import { useAuthStore } from "@/store/auth.store"
import type { CartDto, CartLine } from "@/types/api.types"

export type { CartLine }

interface CartState {
  lines: CartLine[]
  loading: boolean
  addLine: (line: Omit<CartLine, "lineId"> & { lineId?: string }) => void
  addToCart: (line: Omit<CartLine, "lineId"> & { lineId?: string }) => Promise<void>
  removeLine: (lineId: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  clear: () => void
  clearGuestOnly: () => void
  hydrateFromServer: (dto: CartDto) => void
  refreshFromBackend: () => Promise<void>
  resetOnLogout: () => void
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
      loading: false,

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

      addToCart: async (line) => {
        const user = useAuthStore.getState().user
        if (user) {
          await cartService.addToCart(line.variantId, line.quantity)
          await get().refreshFromBackend()
          return
        }
        get().addLine(line)
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

      clearGuestOnly: () => set({ lines: [] }),

      hydrateFromServer: (dto) => {
        const lines = (dto.items ?? []).map((item) => mapCartItemToLine(item))
        set({ lines, loading: false })
      },

      refreshFromBackend: async () => {
        set({ loading: true })
        try {
          const dto = await cartService.getCart()
          get().hydrateFromServer(dto)
        } finally {
          set({ loading: false })
        }
      },

      resetOnLogout: () => set({ lines: [] }),

      subtotal: () => get().lines.reduce((s, l) => s + l.price * l.quantity, 0),

      totalItems: () => get().lines.reduce((s, l) => s + l.quantity, 0),
    }),
    {
      name: "canim-guest-cart-v1",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)
