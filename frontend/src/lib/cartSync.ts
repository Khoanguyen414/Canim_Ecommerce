import { useCartStore } from "@/store/cart.store"
import { cartService } from "@/services/cart.service"
import type { CartLine } from "@/types/api.types"

const syncKey = (userId: number) => `canim_cart_synced_user_${userId}`

export function isGuestCartSyncedForUser(userId: number): boolean {
  return localStorage.getItem(syncKey(userId)) === "1"
}

export function markGuestCartSyncedForUser(userId: number): void {
  localStorage.setItem(syncKey(userId), "1")
}

/** Đồng bộ giỏ guest lên backend đúng 1 lần sau đăng nhập. */
export async function syncGuestCartOnceAfterLogin(
  userId: number,
  guestLines: CartLine[],
): Promise<void> {
  if (isGuestCartSyncedForUser(userId)) {
    return
  }

  if (guestLines.length === 0) {
    markGuestCartSyncedForUser(userId)
    return
  }

  for (const line of guestLines) {
    await cartService.addToCart(line.variantId, line.quantity)
  }

  const variantIds = guestLines.map((l) => l.variantId)
  if (variantIds.length > 0) {
    await cartService.toggleSelection(variantIds, true)
  }

  markGuestCartSyncedForUser(userId)
  useCartStore.getState().clearGuestOnly()
}
