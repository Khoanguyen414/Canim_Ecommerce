import { useEffect, useState, useCallback } from "react"
import { productService } from "@/services/product.service"
import type { ProductDetail } from "@/types/api.types"
import type { ProductFacetParams } from "@/config/productFacets"
import { getApiErrorMessage } from "@/lib/apiError"

export function usePublicProducts(
  facets: ProductFacetParams,
  page: number,
  pageSize = 12,
) {
  const [products, setProducts] = useState<ProductDetail[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await productService.getPublicPage({
        pageNum: page,
        sizePage: pageSize,
        keyWord: facets.q?.trim() || undefined,
        categoryId: facets.categoryId,
        gender: facets.gender,
        group: facets.group,
        facet: facets.facet,
        collection: facets.collection,
        minPrice: facets.minPrice,
        maxPrice: facets.maxPrice,
        sizes: facets.sizes?.join(","),
        colors: facets.colors?.join(","),
        sortBy: facets.sortBy && facets.sortBy !== "default" ? facets.sortBy : undefined,
      })
      if (!data.success || !data.result) {
        throw new Error(data.message || "Không tải được danh sách")
      }
      setProducts(data.result.data)
      setTotalPages(Math.max(1, data.result.totalPages))
    } catch (e) {
      setError(getApiErrorMessage(e))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, facets])

  useEffect(() => {
    void load()
  }, [load])

  return {
    products,
    totalPages,
    loading,
    error,
    reload: load,
  }
}
