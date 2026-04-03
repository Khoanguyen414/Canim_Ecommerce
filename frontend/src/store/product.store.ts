import { create } from "zustand"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating: number
  reviews: number
  inStock: boolean
  colors?: string[]
  sizes?: string[]
  sku?: string
}

interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  filters: {
    category?: string
    priceRange?: [number, number]
    search?: string
  }
  setProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
  setFilters: (filters: ProductState["filters"]) => void
  getFilteredProducts: () => Product[]
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  filters: {},

  setProducts: (products) => set({ products }),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  setFilters: (filters) => set({ filters }),

  getFilteredProducts: () => {
    const { products, filters } = get()
    return products.filter((product) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!product.name.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      if (filters.category && product.category !== filters.category) {
        return false
      }
      if (filters.priceRange) {
        const [min, max] = filters.priceRange
        if (product.price < min || product.price > max) {
          return false
        }
      }
      return true
    })
  },
}))
