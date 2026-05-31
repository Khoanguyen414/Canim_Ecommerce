import { isAxiosError } from "axios"
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

async function readBlobErrorMessage(blob: Blob): Promise<string> {
  try {
    const text = await blob.text()
    const json = JSON.parse(text) as ApiResponse<unknown>
    return json.message ?? "Xuất Excel thất bại"
  } catch {
    return "Xuất Excel thất bại"
  }
}

export async function downloadInventoryExcel() {
  try {
    const res = await inventoryService.exportExcel()
    const blob = res.data
    const contentType = String(res.headers["content-type"] ?? blob.type ?? "")

    if (contentType.includes("application/json") || contentType.includes("text/json")) {
      throw new Error(await readBlobErrorMessage(blob))
    }

    if (blob.size === 0) {
      throw new Error("File Excel rỗng")
    }

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Bao_Cao_Ton_Kho_${Date.now()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
      throw new Error(await readBlobErrorMessage(err.response.data))
    }
    throw err
  }
}
