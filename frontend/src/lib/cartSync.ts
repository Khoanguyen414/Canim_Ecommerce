import { cartService } from "@/services/cart.service"
import type { CartLine } from "@/types/api.types"

/** Đồng bộ giỏ local lên server trước checkout (backend chỉ xử lý giỏ đã chọn). */
export async function syncLocalCartToServer(lines: CartLine[]) {
  for (const line of lines) {
    await cartService.add(line.variantId, line.quantity)
  }
  const variantIds = lines.map((l) => l.variantId)
  if (variantIds.length > 0) {
    await cartService.toggleSelection(variantIds, true)
  }
}
