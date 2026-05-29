import api from "@/lib/axios"
import type { ApiResponse, AuthResult, RegisterPayload } from "@/types/api.types"

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResult>>("/auth/login", { email, password }),

  googleLogin: (idToken: string) =>
    api.post<ApiResponse<AuthResult>>("/auth/google", { idToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", { email }),

  resetPassword: (body: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<ApiResponse<null>>("/auth/reset-password", body),

  register: (body: RegisterPayload) =>
    api.post<ApiResponse<Record<string, unknown>>>("/auth/register", body),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResult>>("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    ),
}
