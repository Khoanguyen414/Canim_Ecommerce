import { useEffect, useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { orderService } from "@/services/order.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { SHIPPING_STATUS_VI } from "@/lib/shippingLabels"
import { getGoogleMapsApiKey } from "@/lib/googleIdentity"
import { toNumber } from "@/lib/format"
import type { OrderDetailDto, OrderTrackingDto } from "@/types/api.types"
import { GoogleMapEmbed } from "@/components/orders/GoogleMapEmbed"

type Props = {
  order: OrderDetailDto
}

export function OrderTrackingPanel({ order }: Props) {
  const [tracking, setTracking] = useState<OrderTrackingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    void orderService
      .getMyTracking(order.id)
      .then((res) => {
        if (!mounted) return
        if (!res.success) throw new Error(res.message)
        setTracking(res.result ?? null)
      })
      .catch((err) => {
        if (!mounted) return
        setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [order.id])

  const lat = toNumber(tracking?.receiverLatitude ?? order.receiverLatitude)
  const lng = toNumber(tracking?.receiverLongitude ?? order.receiverLongitude)
  const mapUrl = tracking?.mapUrl ?? order.mapUrl
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  const mapsKey = getGoogleMapsApiKey()

  const openMapsHref =
    mapUrl ||
    (hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : null)

  return (
    <Card className="p-6">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <MapPin className="h-4 w-4" />
        Theo dõi giao hàng
      </h2>

      {loading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {tracking?.shippingStatus ? (
        <p className="mb-3 text-sm">
          Trạng thái vận chuyển:{" "}
          <strong>{SHIPPING_STATUS_VI[tracking.shippingStatus] ?? tracking.shippingStatus}</strong>
        </p>
      ) : null}

      {hasCoords && mapsKey ? (
        <GoogleMapEmbed latitude={lat} longitude={lng} className="mb-3 h-56 w-full rounded-lg" />
      ) : null}

      {openMapsHref ? (
        <a
          href={openMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Mở vị trí trên Google Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">Chưa có tọa độ giao hàng.</p>
      )}

      {tracking?.events?.length ? (
        <ol className="space-y-3 border-l-2 border-border pl-4">
          {tracking.events.map((ev) => (
            <li key={ev.id} className="relative text-sm">
              <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-primary" />
              <p className="font-medium">
                {SHIPPING_STATUS_VI[ev.shippingStatus] ?? ev.shippingStatus}
              </p>
              {ev.locationLabel ? <p className="text-muted-foreground">{ev.locationLabel}</p> : null}
              {ev.note ? <p className="text-muted-foreground">{ev.note}</p> : null}
              {ev.createdAt ? (
                <p className="text-xs text-muted-foreground">
                  {new Date(ev.createdAt).toLocaleString("vi-VN")}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có cập nhật hành trình.</p>
      )}
    </Card>
  )
}
