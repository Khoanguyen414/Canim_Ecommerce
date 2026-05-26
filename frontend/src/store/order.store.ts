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
  /** Chuỗi tóm tắt giao hàng (đồng bộ khi sửa thông tin); đơn cũ có thể chỉ có trường này */
  deliverySummary: string
  paymentMethod: string
  createdAt: string
  status: OrderStatus
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  customerWard?: string
  customerDistrict?: string
  customerCity?: string
  shippingMethodId?: string
  shippingMethodName?: string
}

interface OrderState {
  orders: PlacedOrder[]
  addOrder: (order: PlacedOrder) => void
  getById: (id: string) => PlacedOrder | undefined
  updateOrder: (id: string, patch: Partial<PlacedOrder>) => void
  cancelOrder: (id: string) => void
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

      updateOrder: (id, patch) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),

      cancelOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)),
        })),
    }),
    {
      name: "canim-orders-v1",
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
)
