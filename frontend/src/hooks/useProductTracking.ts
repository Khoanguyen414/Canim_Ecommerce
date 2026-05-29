import { useCallback, useEffect, useRef } from "react"

import { userEventService } from "@/services/userEvent.service"

type TrackProductParams = {
  productId?: number | null
  variantId?: number | null
  source?: string
}

type TrackSearchParams = {
  keyword?: string | null
  source?: string
}

export function useProductTracking() {
  const trackedViewKeysRef = useRef<Set<string>>(new Set())

  const trackProductClick = useCallback((params: TrackProductParams) => {
    if (!params.productId) return

    void userEventService.trackClickProduct({
      productId: params.productId,
      variantId: params.variantId ?? null,
      source: params.source ?? "PRODUCT_CARD",
    })
  }, [])

  const trackProductView = useCallback((params: TrackProductParams) => {
    if (!params.productId) return

    const trackingKey = `${params.productId}_${params.variantId ?? "default"}_${
      params.source ?? "PRODUCT_DETAIL"
    }`

    if (trackedViewKeysRef.current.has(trackingKey)) {
      return
    }

    trackedViewKeysRef.current.add(trackingKey)

    void userEventService.trackViewProduct({
      productId: params.productId,
      variantId: params.variantId ?? null,
      source: params.source ?? "PRODUCT_DETAIL",
    })
  }, [])

  const trackSearch = useCallback((params: TrackSearchParams) => {
    const keyword = params.keyword?.trim()

    if (!keyword) return

    void userEventService.trackSearch({
      keyword,
      source: params.source ?? "SEARCH_BOX",
    })
  }, [])

  return {
    trackProductClick,
    trackProductView,
    trackSearch,
  }
}

export function useTrackProductView(params: TrackProductParams) {
  const { trackProductView } = useProductTracking()

  useEffect(() => {
    trackProductView(params)
  }, [params.productId, params.variantId, params.source, trackProductView])
}