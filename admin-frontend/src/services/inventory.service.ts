import { api } from "@/lib/http"
import type { ApiResponse, InboundPayload, OutboundPayload } from "@/types/api"

export const inventoryService = {
  inbound(payload: InboundPayload) {
    return api.post<ApiResponse<null>>("/inventory/inbound", payload)
  },

  outbound(payload: OutboundPayload) {
    return api.post<ApiResponse<null>>("/inventory/outbound", payload)
  },

  exportExcel() {
    return api.get<Blob>("/inventory/export-excel", { responseType: "blob" })
  },
}

export async function downloadInventoryExcel() {
  const res = await inventoryService.exportExcel()
  const blob = res.data
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Bao_Cao_Ton_Kho_${Date.now()}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
