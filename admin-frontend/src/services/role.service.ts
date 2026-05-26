import { api } from "@/lib/http"
import type { ApiResponse, RoleRecord } from "@/types/api"

export const roleService = {
  getAll() {
    return api.get<ApiResponse<RoleRecord[]>>("/roles")
  },

  create(name: string) {
    return api.post<ApiResponse<RoleRecord>>("/roles", { name, permissionIds: [] })
  },

  remove(id: number) {
    return api.delete<ApiResponse<void>>(`/roles/${id}`)
  },
}
