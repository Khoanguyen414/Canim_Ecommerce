import { useCallback, useEffect, useState } from "react"
import { productService } from "@/services/product.service"
import { supplierService } from "@/services/supplier.service"
import { warehouseService } from "@/services/warehouse.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { ProductSummary, ProductVariant, Supplier, Warehouse } from "@/types/api"

export type VariantOption = {
  variantId: number
  sku: string
  label: string
  productName: string
  availableQty: number
}

function flattenVariants(products: ProductSummary[]): VariantOption[] {
  const options: VariantOption[] = []
  for (const p of products) {
    for (const v of p.variants ?? []) {
      if (v.id == null || !v.sku) continue
      const parts = [v.sku, v.color, v.size].filter(Boolean)
      options.push({
        variantId: v.id,
        sku: v.sku,
        label: `${p.name} — ${parts.join(" / ")}`,
        productName: p.name,
        availableQty: Number(v.quantity ?? 0),
      })
    }
  }
  return options.sort((a, b) => a.sku.localeCompare(b.sku))
}

export function useInventoryMasterData() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [warehouseId, setWarehouseId] = useState<number | "">("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [whRes, supRes, prodRes] = await Promise.all([
        warehouseService.getAll(),
        supplierService.getAll(),
        productService.getProducts({ pageNum: 1, sizePage: 200, includeHidden: true }),
      ])
      if (!whRes.data.success) throw new Error(whRes.data.message ?? "Không tải được kho")
      if (!supRes.data.success) throw new Error(supRes.data.message ?? "Không tải được NCC")

      const whList = (whRes.data.result ?? []).filter((w) => w.isDeleted !== true)
      const supList = (supRes.data.result ?? []).filter((s) => s.isActive !== false)
      const products = (prodRes.data.result?.data ?? prodRes.data.result?.content ?? []) as ProductSummary[]

      setWarehouses(whList)
      setSuppliers(supList)
      setVariantOptions(flattenVariants(products))

      setWarehouseId((prev) => {
        if (prev !== "" && whList.some((w) => w.id === prev)) return prev
        return whList[0]?.id ?? ""
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
      setWarehouses([])
      setSuppliers([])
      setVariantOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resolvedWarehouseId = (): number | null => {
    if (warehouseId !== "") return Number(warehouseId)
    const first = warehouses[0]?.id
    return first != null ? first : null
  }

  const findVariant = (id: number): VariantOption | undefined =>
    variantOptions.find((v) => v.variantId === id)

  return {
    warehouses,
    suppliers,
    variantOptions,
    warehouseId,
    setWarehouseId,
    loading,
    error,
    load,
    resolvedWarehouseId,
    findVariant,
  }
}

export function sumVariantStock(variants?: ProductVariant[]) {
  return (variants ?? []).reduce((s, v) => s + Number(v.quantity ?? 0), 0)
}
