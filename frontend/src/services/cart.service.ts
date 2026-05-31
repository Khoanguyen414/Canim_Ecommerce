import api from "@/lib/axios"
import type { CartDto } from "@/types/api.types"

export const cartService = {
  getCart: () => api.get<CartDto>("/carts").then((r) => r.data),

  addToCart: (variantId: number, quantity: number) =>
    api.post<CartDto>("/carts/add", { variantId, quantity }).then((r) => r.data),

  updateCartItem: (variantId: number, quantity: number, isSelected: boolean) =>
    api.put<CartDto>("/carts/update", { variantId, quantity, isSelected }).then((r) => r.data),

  removeCartItem: (variantId: number) =>
    api
      .put<CartDto>("/carts/update", { variantId, quantity: 0, isSelected: false })
      .then((r) => r.data),

  toggleSelection: (variantIds: number[], isSelected: boolean) =>
    api.put<CartDto>("/carts/selection", { variantIds, isSelected }).then((r) => r.data),

  clearCart: () => api.delete<string>("/carts/clear").then((r) => r.data),

  /** @deprecated use getCart */
  getMyCart: () => cartService.getCart(),

  /** @deprecated use addToCart */
  add: (variantId: number, quantity: number) => cartService.addToCart(variantId, quantity),

  /** @deprecated use updateCartItem */
  updateItem: (variantId: number, quantity: number, isSelected: boolean) =>
    cartService.updateCartItem(variantId, quantity, isSelected),

  /** @deprecated use clearCart */
  clear: () => cartService.clearCart(),
}
