import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProductDetail } from "@/types/api.types"
import { getMinVariantPrice, getProductMainImage } from "@/lib/product"

export interface WishlistItem {
  productId: number
  name: string
  imageUrl?: string
  price: number
}

interface WishlistState {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => boolean
  remove: (productId: number) => void
  isWishlisted: (productId: number) => boolean
  count: () => number
}

export function productToWishlistItem(product: ProductDetail): WishlistItem {
  return {
    productId: product.id,
    name: product.name,
    imageUrl: getProductMainImage(product),
    price: getMinVariantPrice(product),
  }
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== item.productId),
          }))
          return false
        }
        set((state) => ({
          items: [...state.items, item],
        }))
        return true
      },

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      isWishlisted: (productId) => get().items.some((i) => i.productId === productId),

      count: () => get().items.length,
    }),
    {
      name: "canim-wishlist-v1",
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
