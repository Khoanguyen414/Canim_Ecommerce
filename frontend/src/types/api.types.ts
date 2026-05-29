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

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "UNPAID" | "PENDING_CONFIRMATION" | "PAID" | "REFUNDED"
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "MOMO_QR" | "VNPAY_QR"

export interface OrderDynamicQrDto {
  orderId: number
  orderNo: string
  paymentMethod: PaymentMethod
  amount: number | string
  transferContent: string
  accountName: string
  accountNumber: string
  bankName?: string
  dynamicQrImageUrl?: string | null
  qrPayload?: string | null
  walletAccountNumber?: string
  vietqrBankBin?: string
  momoWalletConfigured?: boolean
}

export interface PersonalQrConfigDto {
  transferNoteHint?: string
  momo: {
    enabled: boolean
    accountName: string
    phone: string
    walletAccountNumber?: string
    vietqrBankBin?: string
    walletConfigured?: boolean
    qrImagePath: string
  }
  vnpay: {
    enabled: boolean
    accountName: string
    bankName: string
    accountNumber: string
    qrImagePath: string
  }
}
export type PaymentTransactionStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED"

export interface CartItemDto {
  id: number
  variantId: number
  sku: string
  productName: string
  color?: string | null
  size?: string | null
  quantity: number
  unitPrice: number | string
  subTotal?: number | string
  isSelected?: boolean
  isAvailable?: boolean
  availableStock?: number
  warningMessage?: string | null
  imageUrl?: string | null
}

export interface CartDto {
  id: number
  userId: number
  items: CartItemDto[]
  totalAmount: number | string
}

export interface CartLine {
  lineId: string
  cartItemId?: number
  productId: number
  variantId: number
  productName: string
  sku: string
  color?: string | null
  size?: string | null
  price: number
  quantity: number
  imageUrl?: string
  isSelected?: boolean
  isAvailable?: boolean
  warningMessage?: string | null
}

export interface CheckoutPayload {
  addressId?: number
  useDefaultAddress?: boolean
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  receiverLatitude?: number
  receiverLongitude?: number
  orderNote?: string
  paymentMethod: PaymentMethod
  shippingMethodId: string
  shippingFee: number
  idempotencyKey?: string
}

export interface UserAddressDto {
  id: number
  receiverName: string
  receiverPhone: string
  provinceCode?: string | null
  provinceName?: string | null
  districtCode?: string | null
  districtName?: string | null
  wardCode?: string | null
  wardName?: string | null
  streetAddress: string
  fullAddress: string
  note?: string | null
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserAddressPayload {
  receiverName: string
  receiverPhone: string
  provinceCode?: string
  provinceName?: string
  districtCode?: string
  districtName?: string
  wardCode?: string
  wardName?: string
  streetAddress: string
  fullAddress: string
  note?: string
  isDefault?: boolean
}

export type ProductReviewStatus = "VISIBLE" | "HIDDEN" | "DELETED"

export interface ProductReviewDto {
  id: number
  productId: number
  variantId?: number | null
  orderId?: number | null
  orderItemId?: number | null
  userId: number
  userName?: string
  rating: number
  comment?: string | null
  status: ProductReviewStatus
  createdAt?: string
  updatedAt?: string
}

export interface ReviewSummaryDto {
  averageRating: number | string
  reviewCount: number
  rating1Count: number
  rating2Count: number
  rating3Count: number
  rating4Count: number
  rating5Count: number
}

export interface CreateReviewPayload {
  orderItemId: number
  rating: number
  comment?: string
}

export interface UpdateReviewPayload {
  rating?: number
  comment?: string
}

export type ShippingStatus =
  | "NOT_SHIPPED"
  | "WAITING_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED"

export interface OrderTrackingEventDto {
  id: number
  orderId: number
  shippingStatus: ShippingStatus
  latitude?: number | string | null
  longitude?: number | string | null
  locationLabel?: string | null
  note?: string | null
  createdById?: number | null
  createdByName?: string | null
  createdAt?: string
  googleMapsUrl?: string | null
}

export interface OrderTrackingDto {
  orderId: number
  receiverLatitude?: number | string | null
  receiverLongitude?: number | string | null
  mapUrl?: string | null
  shippingAddress?: string
  shippingStatus?: ShippingStatus
  events: OrderTrackingEventDto[]
}

export interface UpdateOrderLocationPayload {
  receiverLatitude: number
  receiverLongitude: number
  locationLabel?: string
}

export interface CreateOrderTrackingEventPayload {
  shippingStatus: ShippingStatus
  latitude?: number
  longitude?: number
  locationLabel?: string
  note?: string
}

export interface OrderItemDto {
  id: number
  variantId: number
  skuSnapshot: string
  productNameSnapshot: string
  imageUrlSnapshot?: string | null
  variantName?: string | null
  quantity: number
  price: number | string
  lineTotal: number | string
  imageUrl?: string | null
}

export interface PaymentTransactionDto {
  id: number
  orderId: number
  paymentMethod: PaymentMethod
  amount: number | string
  status: PaymentTransactionStatus
  transactionCode: string
  paidAt?: string | null
  createdAt?: string
}

export interface OrderDetailDto {
  id: number
  orderNo: string
  userId: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  orderStatusLabel?: string
  paymentStatusLabel?: string
  canCancel?: boolean
  nextAction?: string
  subTotal: number | string
  shippingFee: number | string
  discountAmount: number | string
  totalAmount: number | string
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  addressId?: number | null
  receiverProvinceName?: string | null
  receiverDistrictName?: string | null
  receiverWardName?: string | null
  receiverStreetAddress?: string | null
  receiverLatitude?: number | string | null
  receiverLongitude?: number | string | null
  mapUrl?: string | null
  orderNote?: string | null
  cancelReason?: string | null
  shippingProvider?: string | null
  trackingCode?: string | null
  shippingStatus?: ShippingStatus
  createdAt?: string
  updatedAt?: string
  items: OrderItemDto[]
  latestPaymentTransaction?: PaymentTransactionDto | null
}

export interface OrderSummaryDto {
  id: number
  orderNo: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: number | string
  createdAt?: string
}

export interface CreatePaymentPayload {
  paymentMethod: PaymentMethod
}

export interface CreatePaymentResult {
  paymentUrl: string
  transactionCode: string
  paymentMethod: PaymentMethod
  amount: number | string
  status: PaymentTransactionStatus
}

export interface PaymentCallbackResult {
  orderId: number
  transactionCode: string
  transactionStatus: PaymentTransactionStatus
  orderPaymentStatus: PaymentStatus
  message: string
}
