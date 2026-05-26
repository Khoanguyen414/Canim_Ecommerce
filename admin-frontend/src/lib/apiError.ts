import axios from "axios"
import type { ApiResponse } from "@/types/api"

export function getApiErrorMessage(error: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined
    if (data?.message) return data.message
    if (!error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
      return "Không kết nối được backend. Hãy chạy Spring Boot (port 8000) và kiểm tra VITE_API_BASE_URL."
    }
    if (error.response?.status === 403) return "Bạn không có quyền thực hiện thao tác này."
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
