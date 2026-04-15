import api from "@/utils/axios"
import type { ApiResponse, UserProfile } from "@/types/api.types"

export const userService = {
  getMe: () => api.get<ApiResponse<UserProfile>>("/users/me"),
}
