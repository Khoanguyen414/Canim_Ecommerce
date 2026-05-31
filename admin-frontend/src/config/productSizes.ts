/** Size chuẩn — đồng bộ storefront `FILTER_SIZES`. */
export const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"] as const

export type StandardSize = (typeof STANDARD_SIZES)[number]
