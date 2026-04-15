import { useEffect, useState, useCallback } from "react"
import { productService } from "@/services/product.service"
import type { ProductDetail } from "@/types/api.types"
import { getApiErrorMessage } from "@/lib/apiError"

export function usePublicProducts(pageSize = 12) {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
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
        keyWord: keyword.trim() || undefined,
        categoryId,
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
  }, [page, pageSize, keyword, categoryId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    page,
    setPage,
    keyword,
    setKeyword,
    categoryId,
    setCategoryId,
    products,
    totalPages,
    loading,
    error,
    reload: load,
  }
}
