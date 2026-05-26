import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import type { ApiResponse, AuthResult } from "@/types/api"

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/canim_ecommerce"

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

const rawClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

let refreshPromise: Promise<string | null> | null = null

function clearSession() {
  localStorage.removeItem("adminAccessToken")
  localStorage.removeItem("adminRefreshToken")
}

function redirectToLogin() {
  clearSession()
  const path = window.location.pathname
  if (!path.startsWith("/login")) {
    window.location.href = "/login"
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("adminRefreshToken")
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await rawClient.post<ApiResponse<AuthResult>>("/auth/refresh", { refreshToken })
        if (!data.success || !data.result) return null
        localStorage.setItem("adminAccessToken", data.result.accessToken)
        if (data.result.refreshToken) {
          localStorage.setItem("adminRefreshToken", data.result.refreshToken)
        }
        return data.result.accessToken
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("adminAccessToken")
  const url = config.url ?? ""
  const skipAuth = url.includes("/auth/login") || url.includes("/auth/refresh")
  if (token && !skipAuth) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status
    if (!original || original._retry) return Promise.reject(error)

    const url = original.url ?? ""
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/refresh")
    if (status === 401 && !isAuthCall) {
      original._retry = true
      const token = await refreshAccessToken()
      if (token) {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }
      redirectToLogin()
    }
    return Promise.reject(error)
  },
)
