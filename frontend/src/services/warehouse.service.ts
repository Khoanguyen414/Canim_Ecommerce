import api from "@/lib/axios"
import type { ApiResponse, InboundPayload, OutboundPayload, PageResponse, ProductDetail, Warehouse } from "@/types/api.types"

/**
 * Kho vật lý — khớp `WarehouseController` (`/warehouses`).
 */
export const warehouseService = {
  list: () => api.get<ApiResponse<Warehouse[]>>("/warehouses"),

  /** Danh sách sản phẩm admin — dùng chọn variant (ROLE_ADMIN). */
  listProductsForPicker: () =>
    api.get<ApiResponse<PageResponse<ProductDetail>>>("/products", {
      params: { pageNum: 1, sizePage: 200, includeHidden: true },
    }),
}

/**
 * Phiếu nhập/xuất & báo cáo — khớp `InventoryController` (`/inventory`).
 */
export const inventoryService = {
  inbound: (body: InboundPayload) => api.post<ApiResponse<null>>("/inventory/inbound", body),

  outbound: (body: OutboundPayload) => api.post<ApiResponse<null>>("/inventory/outbound", body),

  exportExcel: () =>
    api.get<Blob>("/inventory/export-excel", {
      responseType: "blob",
    }),
}
