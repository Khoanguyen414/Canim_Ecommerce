import api from "@/lib/axios"
import type { CartDto } from "@/types/api.types"

export const cartService = {
  getMyCart: () => api.get<CartDto>("/carts").then((r) => r.data),

  add: (variantId: number, quantity: number) =>
    api.post<CartDto>("/carts/add", { variantId, quantity }).then((r) => r.data),

  updateItem: (variantId: number, quantity: number, isSelected: boolean) =>
    api.put<CartDto>("/carts/update", { variantId, quantity, isSelected }).then((r) => r.data),

  toggleSelection: (variantIds: number[], isSelected: boolean) =>
    api.put<CartDto>("/carts/selection", { variantIds, isSelected }).then((r) => r.data),

  clear: () => api.delete<string>("/carts/clear").then((r) => r.data),
}
