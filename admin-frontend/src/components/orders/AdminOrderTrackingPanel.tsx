import { useCallback, useEffect, useState } from "react"
import { orderService } from "@/services/order.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { OrderTrackingRecord } from "@/types/api"

const STATUS_OPTIONS = [
  "NOT_SHIPPED",
  "WAITING_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "RETURNED",
  "CANCELLED",
] as const

const STATUS_VI: Record<string, string> = {
  NOT_SHIPPED: "Chưa giao",
  WAITING_PICKUP: "Chờ lấy hàng",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  FAILED: "Giao thất bại",
  RETURNED: "Đã hoàn hàng",
  CANCELLED: "Đã hủy",
}

type Props = { orderId: number }

export function AdminOrderTrackingPanel({ orderId }: Props) {
  const [tracking, setTracking] = useState<OrderTrackingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [locationLabel, setLocationLabel] = useState("")
  const [eventStatus, setEventStatus] = useState<string>("IN_TRANSIT")
  const [eventNote, setEventNote] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await orderService.getTracking(orderId)
      if (!data.success) throw new Error(data.message)
      setTracking(data.result ?? null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const handleUpdateLocation = async () => {
    setSaving(true)
    setError(null)
    try {
      const data = await orderService.updateLocation(orderId, {
        receiverLatitude: Number(lat),
        receiverLongitude: Number(lng),
        locationLabel: locationLabel.trim() || undefined,
      })
      if (!data.success) throw new Error(data.message)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleAddEvent = async () => {
    setSaving(true)
    setError(null)
    try {
      const data = await orderService.createTrackingEvent(orderId, {
        shippingStatus: eventStatus,
        latitude: lat ? Number(lat) : undefined,
        longitude: lng ? Number(lng) : undefined,
        locationLabel: locationLabel.trim() || undefined,
        note: eventNote.trim() || undefined,
      })
      if (!data.success) throw new Error(data.message)
      setEventNote("")
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-4 mt-4">
      <h2 className="h5 mb-3">Theo dõi vận chuyển</h2>
      {loading ? <p className="small text-muted">Đang tải...</p> : null}
      {error ? <p className="small text-danger">{error}</p> : null}

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label small">Vĩ độ</label>
          <input className="form-control form-control-sm" value={lat} onChange={(e) => setLat(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Kinh độ</label>
          <input className="form-control form-control-sm" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Nhãn vị trí</label>
          <input
            className="form-control form-control-sm"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
          />
        </div>
      </div>
      <button type="button" className="btn btn-sm btn-outline-primary me-2" disabled={saving} onClick={() => void handleUpdateLocation()}>
        Cập nhật vị trí
      </button>

      <hr />
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <label className="form-label small">Trạng thái sự kiện</label>
          <select className="form-select form-select-sm" value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_VI[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label small">Ghi chú</label>
          <input className="form-control form-control-sm" value={eventNote} onChange={(e) => setEventNote(e.target.value)} />
        </div>
      </div>
      <button type="button" className="btn btn-sm btn-primary" disabled={saving} onClick={() => void handleAddEvent()}>
        Thêm sự kiện tracking
      </button>

      {tracking?.events?.length ? (
        <ol className="mt-3 small mb-0">
          {tracking.events.map((ev) => (
            <li key={ev.id} className="mb-2">
              <strong>{STATUS_VI[ev.shippingStatus] ?? ev.shippingStatus}</strong>
              {ev.locationLabel ? ` — ${ev.locationLabel}` : null}
              {ev.note ? <div className="text-muted">{ev.note}</div> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
