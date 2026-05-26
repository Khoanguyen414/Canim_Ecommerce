import { api } from "@/lib/http"
import type { ApiResponse, UserRecord } from "@/types/api"

export type UserUpdatePayload = {
  fullName?: string
  phone?: string
  roles?: string[]
}

export const userService = {
  getAll() {
    return api.get<ApiResponse<UserRecord[]>>("/users")
  },

  update(id: number, payload: UserUpdatePayload) {
    return api.put<ApiResponse<UserRecord>>(`/users/${id}`, payload)
  },

  remove(id: number) {
    return api.delete<ApiResponse<void>>(`/users/${id}`)
  },
}
