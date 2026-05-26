import api from "@/lib/axios"
import type { ApiResponse, UserProfile, UserProfileUpdatePayload } from "@/types/api.types"

export const userService = {
  getMe: () => api.get<ApiResponse<UserProfile>>("/users/me"),

  updateMe: (body: UserProfileUpdatePayload) =>
    api.put<ApiResponse<UserProfile>>("/users/me", body),
}
