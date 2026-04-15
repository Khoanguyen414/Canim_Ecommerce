import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import type { ApiResponse, AuthResult } from "@/types/api.types"

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/canim_ecommerce"

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

const rawClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await rawClient.post<ApiResponse<AuthResult>>("/auth/refresh", {
          refreshToken,
        })
        if (!data.success || !data.result) return null
        const { accessToken, refreshToken: nextRefresh } = data.result
        localStorage.setItem("accessToken", accessToken)
        if (nextRefresh) localStorage.setItem("refreshToken", nextRefresh)
        return accessToken
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

/** GET-only: omit Bearer so invalid tokens do not break permitAll catalog endpoints. */
function isPublicCatalogGet(config: InternalAxiosRequestConfig): boolean {
  const method = (config.method ?? "get").toLowerCase()
  if (method !== "get") return false
  const url = config.url ?? ""
  return (
    url.includes("/products/public") ||
    url.includes("/products/slug/") ||
    url.includes("/categories/roots") ||
    url === "/categories" ||
    url.startsWith("/categories?")
  )
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken")
  const url = config.url ?? ""
  const skipAuth =
    url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")

  // Invalid/expired JWT on permitAll endpoints still triggers 401 in OAuth2 resource server
  if (token && !skipAuth && !isPublicCatalogGet(config)) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (!original || original._retry) {
      return Promise.reject(error)
    }

    const url = original.url ?? ""
    const isAuthCall =
      url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")

    if (status === 401 && !isAuthCall) {
      original._retry = true
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      }
      const { useAuthStore } = await import("@/store/auth.store")
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(error)
  },
)

export default api
