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
  quantity?: number | null
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

/** Khớp `SupplierResponse` backend (JSON: supplierCode, isActive, …) */
export interface Supplier {
  id: number
  supplierCode: string
  name: string
  contactName?: string | null
  email: string
  phone: string
  address?: string | null
  isActive?: boolean | null
}

/** Khớp `SupplierRequest` — tạo / cập nhật NCC */
export interface SupplierPayload {
  code: string
  name: string
  contactPerson?: string
  email: string
  phone: string
  address?: string
}

export type ReceiptReason =
  | "PURCHASE"
  | "RETURN_TO_SUPPLIER"
  | "SALES_ORDER"
  | "DAMAGE"
  | "STOCKTAKE_ADJUST"
  | "RETURN_FROM_CUSTOMER"

/** Khớp `InboundRequest` backend */
export interface InboundItemPayload {
  variantId: number
  quantity: number
  price: number
}

export interface InboundPayload {
  warehouseId: number
  supplierId: number
  reasonCode: string
  note?: string
  items: InboundItemPayload[]
}

/** Khớp `OutboundRequest` backend */
export interface OutboundItemPayload {
  variantId: number
  quantity: number
}

export interface OutboundPayload {
  warehouseId: number
  reasonCode: string
  orderId?: number
  note?: string
  items: OutboundItemPayload[]
}

/** Khớp entity `Warehouse` (API `/warehouses`) */
export interface Warehouse {
  id: number
  name: string
  address?: string | null
  isActive?: boolean
  isDeleted?: boolean
  createdAt?: string
}

export interface RegisterPayload {
  email: string
  fullName: string
  password: string
  phone?: string
}

/** Khớp `UserProfileRequest` — PUT /users/me */
export interface UserProfileUpdatePayload {
  fullName?: string
  phone?: string
}

/** Khớp `StockCheckRequest` */
export interface StockCheckItemPayload {
  variantId: number
  systemQuantity: number
  actualQuantity: number
  reason?: string
}

export interface StockCheckCreatePayload {
  warehouseId: number
  note?: string
  items: StockCheckItemPayload[]
}

/** Phản hồi tạo phiếu kiểm kê (entity rút gọn cho UI) */
export interface StockCheckSummary {
  id: number
  warehouseId: number
  code: string
  status?: string
  note?: string | null
}

export interface PermissionDto {
  id: number
  name: string
  description?: string | null
}

export interface RoleDto {
  id: number
  name: string
  permissions?: PermissionDto[]
}

export interface RoleCreatePayload {
  name: string
  permissionIds?: number[]
}

export interface WarehousePayload {
  name: string
  address?: string
}

/** Biến thể khi tạo sản phẩm — khớp `ProductVariantRequest` */
export interface ProductVariantInput {
  sku: string
  color?: string
  size?: string
  price: number
}

/** Khớp `ProductCreationRequest` */
export interface ProductCreationPayload {
  name: string
  shortDesc?: string
  longDesc?: string
  categoryId: number
  variants: ProductVariantInput[]
}

/** Khớp `ProductUpdateRequest` (chỉ gửi field cần đổi; slug không đổi từ FE) */
export interface ProductUpdatePayload {
  name?: string
  shortDesc?: string
  longDesc?: string
  categoryId?: number
}

export type CatalogProductStatus = "ACTIVE" | "INACTIVE" | "HIDDEN"

export interface ProductStatusPayload {
  status: CatalogProductStatus
}

/** Khớp `CategoryCreationRequest` */
export interface CategoryCreatePayload {
  name: string
  description?: string
  parentId?: number | null
}

/** Khớp `CategoryUpdateRequest` */
export interface CategoryUpdatePayload {
  name?: string
  description?: string
  parentId?: number | null
}
