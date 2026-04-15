/** Khớp `ApiResponse` Spring Boot */
export interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  result?: T
}

export interface PageResponse<T> {
  page: number
  size: number
  totalElements: number
  totalPages: number
  data: T[]
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  roles: string[]
}

export interface UserProfile {
  id: number
  email: string
  fullName: string
  phone?: string | null
  active: boolean
  roles: string[]
  createdAt?: string
}

export interface ProductVariant {
  id: number
  sku: string
  color?: string | null
  size?: string | null
  price: string | number
}

export interface ProductImage {
  id: number
  url: string
  position: number
  isMain?: boolean | null
}

export interface ProductDetail {
  id: number
  name: string
  slug: string
  shortDesc: string
  longDesc: string
  variants: ProductVariant[]
  status: string
  categoryId: number
  categoryName: string
  categorySlug: string
  images: ProductImage[]
  createdAt?: string
  updatedAt?: string
}

export interface CategoryNode {
  id: number
  name: string
  slug: string
  description?: string | null
  parentId?: number | null
  parentName?: string | null
  children?: CategoryNode[]
  createdAt?: string
}

export interface InventoryRow {
  productId: number
  productName: string
  sku: string
  totalQuantity: number
}

export interface Supplier {
  id: number
  code: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  active?: boolean
}

export type ReceiptReason =
  | "PURCHASE"
  | "RETURN_TO_SUPPLIER"
  | "SALES_ORDER"
  | "DAMAGE"
  | "STOCKTAKE_ADJUST"

export interface InboundItemPayload {
  productId: number
  quantity: number
  price: number
}

export interface InboundPayload {
  supplierId: number
  note?: string
  items: InboundItemPayload[]
}

export interface OutboundItemPayload {
  productId: number
  quantity: number
}

export interface OutboundPayload {
  note?: string
  reason: ReceiptReason
  items: OutboundItemPayload[]
}

export interface RegisterPayload {
  email: string
  fullName: string
  password: string
  phone?: string
}
