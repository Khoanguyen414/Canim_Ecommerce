import axios from "axios"
import type { ApiResponse } from "@/types/api.types"

export function getApiErrorMessage(error: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined
    if (data?.message) return data.message
    if (!error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
      return "Cannot reach the API server (connection refused). Start Spring Boot, or set VITE_API_BASE_URL to match your backend (default: http://localhost:8000/canim_ecommerce)."
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
