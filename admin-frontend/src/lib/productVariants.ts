import { STANDARD_SIZES, type StandardSize } from "@/config/productSizes"

export type ProductColor = {
  id: string
  name: string
}

/** colorId -> size -> quantity (>= 0) */
export type StockMatrix = Record<string, Record<string, number>>

export type VariantPreviewRow = {
  colorId: string
  color: string
  size: string
  skuPreview: string
  stock: number
}

export type VariantSummary = {
  colorCount: number
  sizeCount: number
  variantCount: number
  totalStock: number
}

export type CreateVariantPayload = {
  sku: string
  color: string
  size: string
  price: number
}

export type CreateProductFormSlice = {
  name: string
  categoryId: number | string
  variantPrice: string | number
  colors: ProductColor[]
  selectedSizes: string[]
  stockMatrix: StockMatrix
  warehouseId?: number | string
  supplierId?: number | string
}

let colorIdSeq = 0

export function createColorId(): string {
  colorIdSeq += 1
  return `color-${Date.now()}-${colorIdSeq}`
}

export function normalizeColorName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

export function isDuplicateColor(name: string, colors: ProductColor[], excludeId?: string): boolean {
  const key = normalizeColorName(name).toLowerCase()
  if (!key) return false
  return colors.some((c) => c.id !== excludeId && normalizeColorName(c.name).toLowerCase() === key)
}

/** Mã màu 3 ký tự cho SKU — VD: White → WHT, Blue → BLU */
export function colorToSkuCode(colorName: string): string {
  const ascii = normalizeColorName(colorName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")

  if (ascii.length >= 3) return ascii.slice(0, 3)

  const map: Record<string, string> = {
    TRẮNG: "WHT",
    TRANG: "WHT",
    WHITE: "WHT",
    XANH: "BLU",
    BLUE: "BLU",
    VÀNG: "YEL",
    VANG: "YEL",
    YELLOW: "YEL",
    ĐEN: "BLK",
    DEN: "BLK",
    BLACK: "BLK",
    ĐỎ: "RED",
    DO: "RED",
    RED: "RED",
    HỒNG: "PNK",
    HONG: "PNK",
    PINK: "PNK",
  }
  const mapped = map[ascii]
  if (mapped) return mapped

  return (ascii || "CLR").padEnd(3, "X").slice(0, 3)
}

/** Tiền tố SKU từ tên SP — VD: Áo Polo → APOLO */
export function buildSkuPrefix(productName: string): string {
  const slug = normalizeColorName(productName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")

  if (slug.length >= 4) return slug.slice(0, 5)
  if (slug.length > 0) return slug.padEnd(4, "X")
  return "PROD"
}

export function buildSkuPreview(productName: string, colorName: string, size: string): string {
  return `${buildSkuPrefix(productName)}-${colorToSkuCode(colorName)}-${size}`
}

export function orderSizes(sizes: string[]): StandardSize[] {
  return STANDARD_SIZES.filter((s) => sizes.includes(s))
}

export function ensureStockMatrix(
  colors: ProductColor[],
  selectedSizes: string[],
  prev: StockMatrix = {},
): StockMatrix {
  const next: StockMatrix = {}
  for (const color of colors) {
    next[color.id] = {}
    for (const size of orderSizes(selectedSizes)) {
      const existing = prev[color.id]?.[size]
      next[color.id][size] = typeof existing === "number" && existing >= 0 ? existing : 0
    }
  }
  return next
}

export function buildVariantPreviews(
  productName: string,
  colors: ProductColor[],
  selectedSizes: string[],
  stockMatrix: StockMatrix,
): VariantPreviewRow[] {
  const rows: VariantPreviewRow[] = []
  const sizes = orderSizes(selectedSizes)

  for (const color of colors) {
    for (const size of sizes) {
      rows.push({
        colorId: color.id,
        color: color.name,
        size,
        skuPreview: buildSkuPreview(productName, color.name, size),
        stock: stockMatrix[color.id]?.[size] ?? 0,
      })
    }
  }
  return rows
}

export function computeVariantSummary(
  colors: ProductColor[],
  selectedSizes: string[],
  stockMatrix: StockMatrix,
): VariantSummary {
  const sizes = orderSizes(selectedSizes)
  let totalStock = 0
  for (const color of colors) {
    for (const size of sizes) {
      totalStock += stockMatrix[color.id]?.[size] ?? 0
    }
  }
  return {
    colorCount: colors.length,
    sizeCount: sizes.length,
    variantCount: colors.length * sizes.length,
    totalStock,
  }
}

export function buildCreateVariantsPayload(form: CreateProductFormSlice): CreateVariantPayload[] {
  const price = Number(form.variantPrice)
  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0
  const prefix = buildSkuPrefix(form.name)
  const sizes = orderSizes(form.selectedSizes)

  return form.colors.flatMap((color) =>
    sizes.map((size) => ({
      sku: `${prefix}-${colorToSkuCode(color.name)}-${size}`,
      color: normalizeColorName(color.name),
      size,
      price: safePrice,
    })),
  )
}

export function validateCreateProductForm(form: CreateProductFormSlice): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.name?.trim()) {
    errors.name = "Tên sản phẩm là bắt buộc."
  }

  if (!form.categoryId || Number(form.categoryId) <= 0) {
    errors.categoryId = "Vui lòng chọn danh mục."
  }

  if (!form.colors?.length) {
    errors.colors = "Thêm ít nhất một màu."
  }

  if (!form.selectedSizes?.length) {
    errors.sizes = "Chọn ít nhất một size."
  }

  const price = Number(form.variantPrice)
  if (!Number.isFinite(price) || price < 0) {
    errors.variantPrice = "Giá bán phải là số không âm."
  }

  const sizes = orderSizes(form.selectedSizes ?? [])
  if (form.colors?.length && sizes.length) {
    for (const color of form.colors) {
      for (const size of sizes) {
        const raw = form.stockMatrix?.[color.id]?.[size]
        if (raw === undefined || raw === null || Number.isNaN(Number(raw))) {
          errors.stockMatrix = "Nhập tồn kho (>= 0) cho mọi ô màu × size."
          break
        }
        if (Number(raw) < 0) {
          errors.stockMatrix = "Tồn kho không được âm."
          break
        }
      }
      if (errors.stockMatrix) break
    }
  }

  const summary = computeVariantSummary(form.colors ?? [], form.selectedSizes ?? [], form.stockMatrix ?? {})
  if (summary.totalStock > 0) {
    if (!form.warehouseId || Number(form.warehouseId) <= 0) {
      errors.warehouseId = "Chọn kho để nhập tồn kho ban đầu."
    }
    if (!form.supplierId || Number(form.supplierId) <= 0) {
      errors.supplierId = "Chọn nhà cung cấp."
    }
  }

  return errors
}
