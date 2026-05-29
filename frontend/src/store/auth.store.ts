import { create } from "zustand"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { AuthResult, UserProfile } from "@/types/api.types"

export type AuthUser = {
  id: number
  email: string
  fullName: string
  phone?: string | null
  roles: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithAuthResult: (result: AuthResult) => Promise<void>
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
  /** Sau PUT /users/me — đồng bộ store với payload từ API */
  applyUserProfile: (p: UserProfile) => void
}

function mapProfile(p: UserProfile): AuthUser {
  const roles = p.roles ? [...p.roles] : []
  return {
    id: p.id,
    email: p.email,
    fullName: p.fullName,
    phone: p.phone,
    roles,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  initialized: false,

  clearSession: () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    set({ user: null, accessToken: null, initialized: true })
  },

  applyUserProfile: (p) => {
    set({ user: mapProfile(p) })
  },

  bootstrap: async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      set({ user: null, accessToken: null, initialized: true })
      return
    }
    try {
      const { data } = await userService.getMe()
      if (!data.success || !data.result) {
        set({ user: null, accessToken: null, initialized: true })
        return
      }
      set({
        user: mapProfile(data.result),
        accessToken: token,
        initialized: true,
      })
    } catch {
      set({ user: null, accessToken: null, initialized: true })
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  },

  loginWithAuthResult: async (result: AuthResult) => {
    localStorage.setItem("accessToken", result.accessToken)
    if (result.refreshToken) {
      localStorage.setItem("refreshToken", result.refreshToken)
    }
    set({ accessToken: result.accessToken })

    const me = await userService.getMe()
    if (!me.data.success || !me.data.result) {
      throw new Error(me.data.message || "Không lấy được hồ sơ người dùng")
    }
    set({ user: mapProfile(me.data.result), initialized: true })
  },

  login: async (email: string, password: string) => {
    const { data } = await authService.login(email, password)
    if (!data.success || !data.result) {
      throw new Error(data.message || "Đăng nhập thất bại")
    }
    await useAuthStore.getState().loginWithAuthResult(data.result)
  },

  logout: async () => {
    const refresh = localStorage.getItem("refreshToken")
    try {
      if (refresh) await authService.logout(refresh)
    } catch {
      // vẫn xóa phiên cục bộ
    }
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    set({ user: null, accessToken: null, initialized: true })
  },
}))
