/** Placeholder catalog for the home page when the public API returns no products. */
export interface HomeShowcaseMockItem {
  id: string
  name: string
  image: string
  priceVnd: number
  originalVnd: number
  rating: number
  reviewCount: number
  soldLabel: string
}

export const HOME_SHOWCASE_MOCK: HomeShowcaseMockItem[] = [
  {
    id: "mock-headphones",
    name: "Wireless Bluetooth Headphones — Premium sound",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop",
    priceVnd: 1_100_000,
    originalVnd: 2_150_000,
    rating: 4.5,
    reviewCount: 328,
    soldLabel: "1.2K+",
  },
  {
    id: "mock-watch",
    name: "Smart watch fitness tracker with heart rate monitor",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=750&fit=crop",
    priceVnd: 1_950_000,
    originalVnd: 3_750_000,
    rating: 4.8,
    reviewCount: 512,
    soldLabel: "980+",
  },
  {
    id: "mock-backpack",
    name: "Professional camera backpack — waterproof travel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop",
    priceVnd: 890_000,
    originalVnd: 1_990_000,
    rating: 4.3,
    reviewCount: 245,
    soldLabel: "640+",
  },
  {
    id: "mock-cable",
    name: "USB-C fast charging cable 2m — premium quality",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=750&fit=crop",
    priceVnd: 320_000,
    originalVnd: 620_000,
    rating: 4.6,
    reviewCount: 1023,
    soldLabel: "2.1K+",
  },
  {
    id: "mock-powerbank",
    name: "Portable power bank 30000mAh — fast charging",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=750&fit=crop",
    priceVnd: 720_000,
    originalVnd: 1_450_000,
    rating: 4.7,
    reviewCount: 856,
    soldLabel: "1.5K+",
  },
  {
    id: "mock-ringlight",
    name: "LED ring light for photography with stand",
    image: "https://images.unsplash.com/photo-1615655406736-b37b032baf30?w=600&h=750&fit=crop",
    priceVnd: 610_000,
    originalVnd: 1_220_000,
    rating: 4.4,
    reviewCount: 634,
    soldLabel: "890+",
  },
  {
    id: "mock-keyboard",
    name: "Mechanical keyboard RGB — gaming professional",
    image: "https://images.unsplash.com/photo-1587829191301-0651d71fd3a6?w=600&h=750&fit=crop",
    priceVnd: 1_350_000,
    originalVnd: 3_100_000,
    rating: 4.9,
    reviewCount: 1245,
    soldLabel: "3.4K+",
  },
  {
    id: "mock-mouse",
    name: "Wireless gaming mouse — ergonomic design",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=750&fit=crop",
    priceVnd: 490_000,
    originalVnd: 1_220_000,
    rating: 4.5,
    reviewCount: 789,
    soldLabel: "1.1K+",
  },
]

export function mockDiscountPercent(price: number, original: number): number {
  if (original <= 0 || price >= original) return 0
  return Math.round((1 - price / original) * 100)
}
