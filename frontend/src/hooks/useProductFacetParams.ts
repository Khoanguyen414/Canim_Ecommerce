import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import {
  buildProductsSearchParams,
  legacyQueryToFacets,
  parseProductsSearchParams,
  type ProductFacetParams,
} from "@/config/productFacets"

export function useProductFacetParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const parsed = useMemo(() => {
    const raw = parseProductsSearchParams(searchParams.toString())
    const legacyQ = searchParams.get("q")
    const hasStructured =
      raw.gender || raw.group || raw.facet || raw.collection || raw.categoryId != null

    if (!hasStructured && legacyQ) {
      const migrated = legacyQueryToFacets(legacyQ)
      if (migrated) {
        return { ...raw, ...migrated, page: raw.page }
      }
      return { ...raw, q: legacyQ }
    }

    return raw
  }, [searchParams])

  const applyFacets = useCallback(
    (next: ProductFacetParams, page = 1) => {
      const qs = buildProductsSearchParams(next, page)
      setSearchParams(qs ? new URLSearchParams(qs) : {}, { replace: false })
    },
    [setSearchParams],
  )

  const patchFacets = useCallback(
    (patch: Partial<ProductFacetParams>, page = 1) => {
      const merged: ProductFacetParams = {
        gender: patch.gender !== undefined ? patch.gender : parsed.gender,
        group: patch.group !== undefined ? patch.group : parsed.group,
        facet: patch.facet !== undefined ? patch.facet : parsed.facet,
        collection: patch.collection !== undefined ? patch.collection : parsed.collection,
        categoryId: patch.categoryId !== undefined ? patch.categoryId : parsed.categoryId,
        q: patch.q !== undefined ? patch.q : parsed.q,
        minPrice: patch.minPrice !== undefined ? patch.minPrice : parsed.minPrice,
        maxPrice: patch.maxPrice !== undefined ? patch.maxPrice : parsed.maxPrice,
        sizes: patch.sizes !== undefined ? patch.sizes : parsed.sizes,
        colors: patch.colors !== undefined ? patch.colors : parsed.colors,
        sortBy: patch.sortBy !== undefined ? patch.sortBy : parsed.sortBy,
      }
      if ("gender" in patch) {
        if (!patch.gender) {
          merged.group = undefined
          merged.facet = undefined
        } else if (patch.group === undefined && patch.facet === undefined) {
          merged.group = undefined
          merged.facet = undefined
        }
      }
      if ("group" in patch && patch.facet === undefined) {
        merged.facet = undefined
      }
      applyFacets(merged, page)
    },
    [applyFacets, parsed],
  )

  const clearFacets = useCallback(() => {
    setSearchParams({}, { replace: false })
  }, [setSearchParams])

  return {
    facets: parsed,
    page: parsed.page,
    applyFacets,
    patchFacets,
    clearFacets,
    setPage: (page: number) => applyFacets(parsed, page),
  }
}
