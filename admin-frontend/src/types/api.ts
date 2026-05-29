export type ApiResponse<T> = {
  success: boolean
  message?: string
  result?: T
}

export type AuthResult = {
  accessToken: string
  refreshToken?: string
}

export type UserProfile = {
  id: number
  email: string
  fullName: string
  phone?: string | null
  roles: string[]
}

export type PagedResult<T> = {
  content?: T[]
  data?: T[]
  totalElements: number
  totalPages: number
  page?: number
  size?: number
}

export type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  parentId?: number | null
  parentName?: string | null
  children?: Category[]
  createdAt?: string
}

export type Supplier = {
  id: number
  supplierCode?: string
  name: string
  contactName?: string | null
  email: string
  phone: string
  address?: string | null
  isActive?: boolean
  createdAt?: string
}

export type Warehouse = {
  id: number
  name: string
  address?: string | null
  isActive?: boolean
  isDeleted?: boolean
  createdAt?: string
}

export type ProductVariant = {
  id: number
  sku: string
  color?: string | null
  size?: string | null
  price?: number
  quantity?: number
}

export type ProductSummary = {
  id: number
  name: string
  slug?: string
  status?: string
  variants?: ProductVariant[]
  images?: { url: string; isMain?: boolean }[]
}

export type InboundItemPayload = {
  variantId: number
  quantity: number
  price: number
  expiredAt?: string
}

export type InboundPayload = {
  warehouseId: number
  supplierId: number
  note?: string
  items: InboundItemPayload[]
}

export type OutboundItemPayload = {
  variantId: number
  quantity: number
}

export type OutboundPayload = {
  warehouseId: number
  orderId?: number
  note?: string
  items: OutboundItemPayload[]
}

export type StockCheckItemPayload = {
  variantId: number
  systemQuantity: number
  actualQuantity: number
  reason?: string
}

export type StockCheckCreatePayload = {
  warehouseId: number
  note?: string
  items: StockCheckItemPayload[]
}

export type StockCheckSummary = {
  id: number
  warehouseId: number
  code: string
  status?: string
  note?: string | null
}

export type UserRecord = {
  id: number
  email: string
  fullName: string
  phone?: string | null
  active: boolean
  roles: string[]
  createdAt?: string
}

export type RoleRecord = {
  id: number
  name: string
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "UNPAID" | "PENDING_CONFIRMATION" | "PAID" | "REFUNDED"
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "MOMO_QR" | "VNPAY_QR"

export type OrderItemRecord = {
  id: number
  variantId: number
  skuSnapshot: string
  productNameSnapshot: string
  quantity: number
  price: number | string
  lineTotal: number | string
  imageUrl?: string | null
}

export type OrderSummaryRecord = {
  id: number
  orderNo: string
  userId: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: number | string
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  orderNote?: string | null
  createdAt?: string
}

export type OrderTrackingEventRecord = {
  id: number
  orderId: number
  shippingStatus: string
  latitude?: number | string | null
  longitude?: number | string | null
  locationLabel?: string | null
  note?: string | null
  createdAt?: string
}

export type OrderTrackingRecord = {
  orderId: number
  receiverLatitude?: number | string | null
  receiverLongitude?: number | string | null
  mapUrl?: string | null
  shippingAddress?: string
  shippingStatus?: string
  events: OrderTrackingEventRecord[]
}

export type OrderDetailRecord = OrderSummaryRecord & {
  subTotal: number | string
  shippingFee: number | string
  discountAmount: number | string
  orderStatusLabel?: string
  paymentStatusLabel?: string
  canCancel?: boolean
  items: OrderItemRecord[]
}
