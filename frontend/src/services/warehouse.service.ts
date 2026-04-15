import api from "@/utils/axios"
import type {
  ApiResponse,
  InboundPayload,
  InventoryRow,
  OutboundPayload,
} from "@/types/api.types"

export const warehouseService = {
  getInventory: () => api.get<ApiResponse<InventoryRow[]>>("/warehouse/inventory"),

  inbound: (body: InboundPayload) =>
    api.post<ApiResponse<unknown>>("/warehouse/inbound", body),

  outbound: (body: OutboundPayload) =>
    api.post<ApiResponse<null>>("/warehouse/outbound", body),

  exportInventoryExcel: () =>
    api.get<Blob>("/warehouse/inventory/export", { responseType: "blob" }),
}
