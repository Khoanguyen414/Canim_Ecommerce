import { create } from "zustand"
import { api } from "@/lib/http"
import { hasAdminRole } from "@/lib/roles"
import type { ApiResponse, AuthResult, UserProfile } from "@/types/api"

type AuthUser = {
  id: number
  email: string
  fullName: string
  roles: string[]
}

type AuthState = {
  initialized: boolean
  loading: boolean
  user: AuthUser | null
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

function mapUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    roles: profile.roles ?? [],
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  initialized: false,
  loading: false,
  user: null,

  bootstrap: async () => {
    const token = localStorage.getItem("adminAccessToken")
    if (!token) {
      set({ initialized: true, user: null })
      return
    }
    try {
      const { data } = await api.get<ApiResponse<UserProfile>>("/users/me")
      if (!data.success || !data.result || !hasAdminRole(data.result.roles)) {
        localStorage.removeItem("adminAccessToken")
        localStorage.removeItem("adminRefreshToken")
        set({ initialized: true, user: null })
        return
      }
      set({ initialized: true, user: mapUser(data.result) })
    } catch {
      localStorage.removeItem("adminAccessToken")
      localStorage.removeItem("adminRefreshToken")
      set({ initialized: true, user: null })
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data } = await api.post<ApiResponse<AuthResult>>("/auth/login", { email, password })
      if (!data.success || !data.result) {
        throw new Error(data.message ?? "Đăng nhập thất bại")
      }
      localStorage.setItem("adminAccessToken", data.result.accessToken)
      if (data.result.refreshToken) {
        localStorage.setItem("adminRefreshToken", data.result.refreshToken)
      }
      const me = await api.get<ApiResponse<UserProfile>>("/users/me")
      if (!me.data.success || !me.data.result || !hasAdminRole(me.data.result.roles)) {
        throw new Error("Tài khoản không có quyền ADMIN")
      }
      set({ user: mapUser(me.data.result), initialized: true, loading: false })
    } catch (err) {
      localStorage.removeItem("adminAccessToken")
      localStorage.removeItem("adminRefreshToken")
      set({ loading: false, user: null })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem("adminAccessToken")
    localStorage.removeItem("adminRefreshToken")
    set({ user: null, initialized: true })
  },
}))
