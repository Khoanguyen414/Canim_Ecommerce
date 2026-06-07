import axios from "axios"

type ApiResponse<T> = {
  message?: string
  data?: T
}

const DEFAULT_ERROR_MESSAGE = "Đã xảy ra lỗi. Vui lòng thử lại."
const NETWORK_ERROR_MESSAGE =
  "Không kết nối được backend. Vui lòng kiểm tra backend local/production hoặc cấu hình VITE_API_BASE_URL."

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