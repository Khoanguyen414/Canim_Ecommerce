import api from "@/lib/axios"
import type { ApiResponse, UserAddressDto, UserAddressPayload } from "@/types/api.types"

export const addressService = {
  list: () => api.get<ApiResponse<UserAddressDto[]>>("/user-addresses").then((r) => r.data),

  create: (body: UserAddressPayload) =>
    api.post<ApiResponse<UserAddressDto>>("/user-addresses", body).then((r) => r.data),

  update: (addressId: number, body: Partial<UserAddressPayload>) =>
    api.put<ApiResponse<UserAddressDto>>(`/user-addresses/${addressId}`, body).then((r) => r.data),

  remove: (addressId: number) =>
    api.delete<ApiResponse<null>>(`/user-addresses/${addressId}`).then((r) => r.data),

  setDefault: (addressId: number) =>
    api.patch<ApiResponse<UserAddressDto>>(`/user-addresses/${addressId}/default`).then((r) => r.data),
}
