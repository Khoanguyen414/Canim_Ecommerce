import api from "@/lib/axios"

export type UserEventType =
  | "VIEW"
  | "CLICK"
  | "ADD_TO_CART"
  | "PURCHASE"
  | "SEARCH"

export type TrackUserEventRequest = {
  eventType: UserEventType
  productId?: number | null
  variantId?: number | null
  keyword?: string | null
  source?: string | null
  page?: string | null
  referrer?: string | null
  device?: string | null
}

const getDeviceType = (): string => {
  const width = window.innerWidth

  if (width < 768) return "MOBILE"
  if (width < 1024) return "TABLET"

  return "DESKTOP"
}

const getCurrentPath = (): string => {
  return `${window.location.pathname}${window.location.search}`
}

const sendTrackingSafely = async (body: TrackUserEventRequest) => {
  try {
    await api.post("/user-events/track", {
      ...body,
      page: body.page ?? getCurrentPath(),
      referrer: body.referrer ?? document.referrer ?? null,
      device: body.device ?? getDeviceType(),
    })
  } catch (error) {
    console.warn("[UserEventTracking] Failed to track event:", error)
  }
}

export const userEventService = {
  trackEvent: (body: TrackUserEventRequest) => {
    return sendTrackingSafely(body)
  },

  trackViewProduct: (params: {
    productId: number
    variantId?: number | null
    source?: string
  }) => {
    return sendTrackingSafely({
      eventType: "VIEW",
      productId: params.productId,
      variantId: params.variantId ?? null,
      source: params.source ?? "PRODUCT_DETAIL",
    })
  },

  trackClickProduct: (params: {
    productId: number
    variantId?: number | null
    source?: string
  }) => {
    return sendTrackingSafely({
      eventType: "CLICK",
      productId: params.productId,
      variantId: params.variantId ?? null,
      source: params.source ?? "PRODUCT_CARD",
    })
  },

  trackSearch: (params: {
    keyword: string
    source?: string
  }) => {
    const keyword = params.keyword.trim()

    if (!keyword) return Promise.resolve()

    return sendTrackingSafely({
      eventType: "SEARCH",
      keyword,
      productId: null,
      variantId: null,
      source: params.source ?? "SEARCH_BOX",
    })
  },
}