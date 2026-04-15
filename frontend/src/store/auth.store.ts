import { create } from "zustand"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { UserProfile } from "@/types/api.types"

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
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
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

  login: async (email: string, password: string) => {
    const { data } = await authService.login(email, password)
    if (!data.success || !data.result) {
      throw new Error(data.message || "Đăng nhập thất bại")
    }
    const { accessToken, refreshToken } = data.result
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    set({ accessToken })

    const me = await userService.getMe()
    if (!me.data.success || !me.data.result) {
      throw new Error(me.data.message || "Không lấy được hồ sơ người dùng")
    }
    set({ user: mapProfile(me.data.result), initialized: true })
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
