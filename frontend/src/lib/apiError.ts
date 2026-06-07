import axios from "axios"
import type { ApiResponse } from "@/types/api.types"

const DEFAULT_ERROR_MESSAGE = "Đã xảy ra lỗi. Vui lòng thử lại."
const NETWORK_ERROR_MESSAGE =
  "Không kết nối được backend. Vui lòng kiểm tra kết nối mạng, trạng thái Backend Railway hoặc cấu hình VITE_API_BASE_URL."

export function getApiErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined

    if (data?.message) {
      return data.message
    }

    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" || error.message === "Network Error")

    if (isNetworkError) {
      return NETWORK_ERROR_MESSAGE
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}