import api from "@/utils/axios"
import type { ApiResponse, AuthResult, RegisterPayload } from "@/types/api.types"

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResult>>("/auth/login", { email, password }),

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
