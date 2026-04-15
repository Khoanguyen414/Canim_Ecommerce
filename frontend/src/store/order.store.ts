import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartLine } from "@/store/cart.store"

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

export interface PlacedOrder {
  id: string
  orderCode: string
  items: CartLine[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  deliverySummary: string
  paymentMethod: string
  createdAt: string
  status: OrderStatus
}

interface OrderState {
  orders: PlacedOrder[]
  addOrder: (order: PlacedOrder) => void
  getById: (id: string) => PlacedOrder | undefined
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      getById: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: "canim-orders-v1",
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
)
