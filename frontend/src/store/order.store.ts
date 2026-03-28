import { create } from "zustand"

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  id: string
  orderCode: string
  items: OrderItem[]
  totalPrice: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  deliveryAddress: string
  paymentMethod: string
  notes?: string
}

interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  addOrder: (order: Order) => void
  setSelectedOrder: (order: Order | null) => void
  getOrderById: (id: string) => Order | undefined
  fetchOrders: () => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,

  addOrder: (order) => {
    set((state) => ({
      orders: [...state.orders, order],
    }))
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  getOrderById: (id) => {
    return get().orders.find((order) => order.id === id)
  },

  fetchOrders: () => {
    // TODO: Fetch orders from API
  },
}))
