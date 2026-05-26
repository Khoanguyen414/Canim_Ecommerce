/** Tham số facet — đồng bộ URL và API `/products/public`. */
export type ProductSortBy =
  | "default"
  | "newest"
  | "bestseller"
  | "price-desc"
  | "price-asc"

export type ProductFacetParams = {
  gender?: "nam" | "nu"
  group?: "phu-kien" | "ao" | "quan" | "the-thao"
  facet?: string
  collection?: "new" | "sale" | "bestseller" | "promo"
  categoryId?: number
  q?: string
  sizes?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: ProductSortBy
}

export const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: "default", label: "Mặc định" },
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Được mua nhiều nhất" },
  { value: "price-desc", label: "Giá: cao đến thấp" },
  { value: "price-asc", label: "Giá: thấp đến cao" },
]

export const FILTER_SIZES = ["S", "M", "L", "XL", "XXL"] as const
export const FILTER_COLORS = ["Đen", "Trắng", "Hồng", "Xanh", "Nâu", "Be"] as const

export const FACET_LABELS: Record<string, string> = {
  tat: "Tất",
  tui: "Túi xách",
  mu: "Mũ",
  "that-lung": "Thắt lưng",
  "phu-kien-khac": "Phụ kiện khác",
  "ao-khoac": "Áo khoác",
  "ao-ni": "Áo nỉ",
  "ao-len": "Áo len",
  "ao-so-mi": "Áo sơ mi",
  "ao-polo": "Áo polo",
  "ao-thun": "Áo thun",
  "ao-hoodie-ni": "Áo hoodie / nỉ",
  "quan-kaki": "Quần kaki",
  "quan-short": "Quần short",
  "quan-jeans": "Quần jeans",
  "quan-au": "Quần âu",
  "quan-dai": "Quần dài",
  "quan-ni": "Quần nỉ",
  "quan-the-thao": "Quần thể thao",
  "ao-polo-the-thao": "Áo polo thể thao",
  "ao-thun-the-thao": "Áo thun thể thao",
  "bo-the-thao": "Bộ thể thao",
}

export type FacetGroup = NonNullable<ProductFacetParams["group"]>
export type FacetGender = NonNullable<ProductFacetParams["gender"]>

export const FACET_GROUP_LABELS: Record<FacetGroup, string> = {
  "phu-kien": "Phụ kiện",
  ao: "Áo",
  quan: "Quần",
  "the-thao": "Đồ thể thao",
}

export const FACET_GENDER_LABELS: Record<FacetGender, string> = {
  nam: "Nam",
  nu: "Nữ",
}

export const COLLECTION_LABELS: Record<NonNullable<ProductFacetParams["collection"]>, string> = {
  new: "Sản phẩm mới",
  sale: "Khuyến mãi",
  bestseller: "Bán chạy",
  promo: "Ưu đãi",
}

const RESERVED_KEYS = new Set([
  "gender",
  "group",
  "facet",
  "collection",
  "categoryId",
  "q",
  "sizes",
  "colors",
  "minPrice",
  "maxPrice",
  "sortBy",
  "page",
])

export function buildProductsSearchParams(params: ProductFacetParams, page?: number): string {
  const sp = new URLSearchParams()
  if (params.gender) sp.set("gender", params.gender)
  if (params.group) sp.set("group", params.group)
  if (params.facet) sp.set("facet", params.facet)
  if (params.collection) sp.set("collection", params.collection)
  if (params.categoryId != null) sp.set("categoryId", String(params.categoryId))
  if (params.q?.trim()) sp.set("q", params.q.trim())
  if (params.minPrice != null) sp.set("minPrice", String(params.minPrice))
  if (params.maxPrice != null) sp.set("maxPrice", String(params.maxPrice))
  if (params.sizes?.length) sp.set("sizes", params.sizes.join(","))
  if (params.colors?.length) sp.set("colors", params.colors.join(","))
  if (params.sortBy && params.sortBy !== "default") sp.set("sortBy", params.sortBy)
  if (page != null && page > 1) sp.set("page", String(page))
  return sp.toString()
}

export function productsUrl(params: ProductFacetParams = {}, page?: number): string {
  const qs = buildProductsSearchParams(params, page)
  return qs ? `/products?${qs}` : "/products"
}

export function parseProductsSearchParams(search: string): ProductFacetParams & { page: number } {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const gender = sp.get("gender")
  const group = sp.get("group")
  const facet = sp.get("facet")
  const collection = sp.get("collection")
  const categoryRaw = sp.get("categoryId")
  const q = sp.get("q") ?? undefined
  const minRaw = sp.get("minPrice")
  const maxRaw = sp.get("maxPrice")
  const pageRaw = sp.get("page")
  const sizesRaw = sp.get("sizes")
  const colorsRaw = sp.get("colors")
  const sortRaw = sp.get("sortBy")

  const result: ProductFacetParams & { page: number } = { page: 1 }

  if (gender === "nam" || gender === "nu") result.gender = gender
  if (group === "phu-kien" || group === "ao" || group === "quan" || group === "the-thao") {
    result.group = group
  }
  if (facet) result.facet = facet
  if (collection === "new" || collection === "sale" || collection === "bestseller" || collection === "promo") {
    result.collection = collection
  }
  if (categoryRaw) {
    const n = Number(categoryRaw)
    if (Number.isFinite(n)) result.categoryId = n
  }
  if (q) result.q = q
  if (minRaw) {
    const n = Number(minRaw)
    if (Number.isFinite(n)) result.minPrice = n
  }
  if (maxRaw) {
    const n = Number(maxRaw)
    if (Number.isFinite(n)) result.maxPrice = n
  }
  if (pageRaw) {
    const p = Number(pageRaw)
    if (Number.isFinite(p) && p > 0) result.page = p
  }
  if (sizesRaw) {
    const sizes = sizesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    if (sizes.length) result.sizes = sizes
  }
  if (colorsRaw) {
    const colors = colorsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    if (colors.length) result.colors = colors
  }
  if (
    sortRaw === "newest" ||
    sortRaw === "bestseller" ||
    sortRaw === "price-desc" ||
    sortRaw === "price-asc" ||
    sortRaw === "default"
  ) {
    result.sortBy = sortRaw
  }

  return result
}

export function getProductPageMeta(params: ProductFacetParams): {
  title: string
  breadcrumbs: { label: string; facets?: ProductFacetParams }[]
} {
  const crumbs: { label: string; facets?: ProductFacetParams }[] = [
    { label: "Trang chủ", facets: {} },
  ]

  if (params.gender) {
    crumbs.push({
      label: FACET_GENDER_LABELS[params.gender],
      facets: { gender: params.gender },
    })
  }

  if (params.group) {
    crumbs.push({
      label: FACET_GROUP_LABELS[params.group].toUpperCase(),
      facets: { gender: params.gender, group: params.group },
    })
  }

  if (params.facet) {
    const facetLabel = FACET_LABELS[params.facet] ?? params.facet.replace(/-/g, " ")
    crumbs.push({
      label: facetLabel,
      facets: { gender: params.gender, group: params.group, facet: params.facet },
    })
  }

  let title = "SẢN PHẨM"
  if (params.facet) {
    const facetLabel = FACET_LABELS[params.facet] ?? params.facet
    const genderLabel = params.gender === "nu" ? "NỮ" : params.gender === "nam" ? "NAM" : ""
    title = `${facetLabel} ${genderLabel}`.trim().toUpperCase()
  } else if (params.group) {
    title = `${FACET_GROUP_LABELS[params.group]} ${params.gender === "nu" ? "NỮ" : "NAM"}`.trim().toUpperCase()
  } else if (params.gender) {
    title = `THỜI TRANG ${FACET_GENDER_LABELS[params.gender].toUpperCase()}`
  } else if (params.collection) {
    title = COLLECTION_LABELS[params.collection].toUpperCase()
  }

  return { title, breadcrumbs: crumbs }
}

/** Chuyển URL cũ `?q=Áo khoác nam` sang facet (nếu khớp menu). */
export function legacyQueryToFacets(q: string): ProductFacetParams | null {
  const normalized = q.trim().toLowerCase()
  if (!normalized) return null
  for (const entry of NAV_FACET_LOOKUP) {
    if (entry.label.toLowerCase() === normalized) return { ...entry.facets }
  }
  return null
}

export function describeActiveFacets(params: ProductFacetParams): string[] {
  const labels: string[] = []
  if (params.gender) labels.push(FACET_GENDER_LABELS[params.gender])
  if (params.group) labels.push(FACET_GROUP_LABELS[params.group])
  if (params.facet) labels.push(FACET_LABELS[params.facet] ?? params.facet.replace(/-/g, " "))
  if (params.sizes?.length) labels.push(`Size: ${params.sizes.join(", ")}`)
  if (params.colors?.length) labels.push(`Màu: ${params.colors.join(", ")}`)
  if (params.collection) labels.push(COLLECTION_LABELS[params.collection])
  if (params.q?.trim()) labels.push(`Từ khóa: ${params.q.trim()}`)
  if (params.categoryId != null) labels.push(`Danh mục #${params.categoryId}`)
  return labels
}

export function hasActiveFacets(params: ProductFacetParams): boolean {
  return Boolean(
    params.gender ||
      params.group ||
      params.facet ||
      params.collection ||
      params.categoryId != null ||
      params.q?.trim() ||
      params.minPrice != null ||
      params.maxPrice != null ||
      (params.sizes?.length ?? 0) > 0 ||
      (params.colors?.length ?? 0) > 0,
  )
}

export type NavFacetItem = { label: string; facets: ProductFacetParams }

export type NavMegaGroup = { title: string; items: NavFacetItem[] }

function item(label: string, facets: ProductFacetParams): NavFacetItem {
  return { label, facets }
}

export const MEN_NAV_GROUPS: NavMegaGroup[] = [
  {
    title: "Phụ kiện nam",
    items: [
      item("Tất nam", { gender: "nam", group: "phu-kien", facet: "tat" }),
      item("Túi xách nam", { gender: "nam", group: "phu-kien", facet: "tui" }),
      item("Mũ nam", { gender: "nam", group: "phu-kien", facet: "mu" }),
      item("Thắt lưng nam", { gender: "nam", group: "phu-kien", facet: "that-lung" }),
    ],
  },
  {
    title: "Áo nam",
    items: [
      item("Áo khoác nam", { gender: "nam", group: "ao", facet: "ao-khoac" }),
      item("Áo nỉ nam", { gender: "nam", group: "ao", facet: "ao-ni" }),
      item("Áo len nam", { gender: "nam", group: "ao", facet: "ao-len" }),
      item("Áo sơ mi nam", { gender: "nam", group: "ao", facet: "ao-so-mi" }),
      item("Áo polo nam", { gender: "nam", group: "ao", facet: "ao-polo" }),
      item("Áo thun nam", { gender: "nam", group: "ao", facet: "ao-thun" }),
    ],
  },
  {
    title: "Quần nam",
    items: [
      item("Quần kaki", { gender: "nam", group: "quan", facet: "quan-kaki" }),
      item("Quần short nam", { gender: "nam", group: "quan", facet: "quan-short" }),
      item("Quần jeans nam", { gender: "nam", group: "quan", facet: "quan-jeans" }),
      item("Quần âu nam", { gender: "nam", group: "quan", facet: "quan-au" }),
    ],
  },
  {
    title: "Đồ thể thao nam",
    items: [
      item("Quần thể thao nam", { gender: "nam", group: "the-thao", facet: "quan-the-thao" }),
      item("Áo polo thể thao nam", { gender: "nam", group: "the-thao", facet: "ao-polo-the-thao" }),
      item("Áo thun thể thao nam", { gender: "nam", group: "the-thao", facet: "ao-thun-the-thao" }),
      item("Bộ thể thao nam", { gender: "nam", group: "the-thao", facet: "bo-the-thao" }),
    ],
  },
]

export const WOMEN_NAV_GROUPS: NavMegaGroup[] = [
  {
    title: "Phụ kiện nữ",
    items: [
      item("Tất nữ", { gender: "nu", group: "phu-kien", facet: "tat" }),
      item("Túi nữ", { gender: "nu", group: "phu-kien", facet: "tui" }),
      item("Phụ kiện nữ khác", { gender: "nu", group: "phu-kien", facet: "phu-kien-khac" }),
    ],
  },
  {
    title: "Áo nữ",
    items: [
      item("Áo khoác nữ", { gender: "nu", group: "ao", facet: "ao-khoac" }),
      item("Áo hoodie - Áo nỉ nữ", { gender: "nu", group: "ao", facet: "ao-hoodie-ni" }),
      item("Áo polo nữ", { gender: "nu", group: "ao", facet: "ao-polo" }),
      item("Áo sơ mi nữ", { gender: "nu", group: "ao", facet: "ao-so-mi" }),
      item("Áo thun nữ", { gender: "nu", group: "ao", facet: "ao-thun" }),
    ],
  },
  {
    title: "Quần nữ",
    items: [
      item("Quần dài nữ", { gender: "nu", group: "quan", facet: "quan-dai" }),
      item("Quần nỉ nữ", { gender: "nu", group: "quan", facet: "quan-ni" }),
      item("Quần kaki nữ", { gender: "nu", group: "quan", facet: "quan-kaki" }),
      item("Quần jeans nữ", { gender: "nu", group: "quan", facet: "quan-jeans" }),
      item("Quần âu nữ", { gender: "nu", group: "quan", facet: "quan-au" }),
    ],
  },
  {
    title: "Đồ thể thao nữ",
    items: [
      item("Quần thể thao nữ", { gender: "nu", group: "the-thao", facet: "quan-the-thao" }),
      item("Áo polo thể thao nữ", { gender: "nu", group: "the-thao", facet: "ao-polo-the-thao" }),
      item("Bộ thể thao nữ", { gender: "nu", group: "the-thao", facet: "bo-the-thao" }),
    ],
  },
]

const NAV_FACET_LOOKUP: NavFacetItem[] = [
  ...MEN_NAV_GROUPS.flatMap((g) => g.items),
  ...WOMEN_NAV_GROUPS.flatMap((g) => g.items),
]

export function isProductsFacetSearch(search: string): boolean {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  for (const key of sp.keys()) {
    if (RESERVED_KEYS.has(key)) return true
  }
  return false
}
