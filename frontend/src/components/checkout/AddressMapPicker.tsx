import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPinned, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import type { VnProvince } from "@/services/vnAddress.service"
import { reverseVietnam, searchVietnamWithFallbacks, type NominatimHit } from "@/lib/nominatimGeocode"
import { matchHitToVnForm } from "@/lib/matchGeocodeToVn"
import { cn } from "@/lib/cn"

// Leaflet default icon paths (Vite bundling)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Props = {
  provinces: VnProvince[]
  disabled?: boolean
  onApply: (parts: { address: string; city: string; district: string; ward: string }) => void
}

export function AddressMapPicker({ provinces, disabled, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimHit[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<NominatimHit | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [reverseLoading, setReverseLoading] = useState(false)

  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastSearchAtRef = useRef(0)
  const reverseAbortRef = useRef<AbortController | null>(null)

  const preview = useMemo(() => (selected ? matchHitToVnForm(selected, provinces) : null), [selected, provinces])

  const setMarkerPosition = useCallback((nextLat: number, nextLng: number, pan = true) => {
    setLat(nextLat)
    setLng(nextLng)
    const map = mapInstanceRef.current
    const marker = markerRef.current
    if (marker) {
      marker.setLatLng([nextLat, nextLng])
    }
    if (map && pan) {
      map.setView([nextLat, nextLng], Math.max(map.getZoom(), 16), { animate: true })
    }
  }, [])

  const runReverse = useCallback(async (nextLat: number, nextLng: number) => {
    reverseAbortRef.current?.abort()
    const ac = new AbortController()
    reverseAbortRef.current = ac
    setReverseLoading(true)
    try {
      const hit = await reverseVietnam(nextLat, nextLng, ac.signal)
      if (!ac.signal.aborted && hit) setSelected(hit)
    } catch {
      /* ignore */
    } finally {
      if (!ac.signal.aborted) setReverseLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      setSearchError(null)
      return
    }

    const t = window.setTimeout(() => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      const now = Date.now()
      const wait = Math.max(0, 1100 - (now - lastSearchAtRef.current))
      window.setTimeout(() => {
        if (ac.signal.aborted) return
        setLoadingSearch(true)
        setSearchError(null)
        void searchVietnamWithFallbacks(q, ac.signal)
          .then((list) => {
            lastSearchAtRef.current = Date.now()
            setResults(list)
          })
          .catch((e: unknown) => {
            if (ac.signal.aborted) return
            setSearchError(e instanceof Error ? e.message : "Lỗi tìm kiếm")
            setResults([])
          })
          .finally(() => {
            if (!ac.signal.aborted) setLoadingSearch(false)
          })
      }, wait)
    }, 450)

    return () => window.clearTimeout(t)
  }, [query, open])

  useEffect(() => {
    if (!open) {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open || lat == null || lng == null || !mapRef.current) return

    if (!mapInstanceRef.current) {
      const el = mapRef.current
      const map = L.map(el, { zoomControl: true }).setView([lat, lng], 16)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map)
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const ll = marker.getLatLng()
        void runReverse(ll.lat, ll.lng)
      })
      mapInstanceRef.current = map
      markerRef.current = marker
      requestAnimationFrame(() => {
        map.invalidateSize()
      })
    } else {
      setMarkerPosition(lat, lng, true)
      requestAnimationFrame(() => {
        mapInstanceRef.current?.invalidateSize()
      })
    }
  }, [open, lat, lng, runReverse, setMarkerPosition])

  const pickHit = (hit: NominatimHit) => {
    const la = Number.parseFloat(hit.lat)
    const lo = Number.parseFloat(hit.lon)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return
    setSelected(hit)
    setMarkerPosition(la, lo, true)
  }

  const handleApply = () => {
    if (!selected) return
    onApply(matchHitToVnForm(selected, provinces))
    setQuery("")
    setResults([])
    setSearchError(null)
    setSelected(null)
    setLat(null)
    setLng(null)
    setOpen(false)
  }

  const mapReady = lat != null && lng != null

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((o) => {
            const next = !o
            if (next) {
              setQuery("")
              setResults([])
              setSearchError(null)
              setSelected(null)
              setLat(null)
              setLng(null)
              abortRef.current?.abort()
              reverseAbortRef.current?.abort()
            }
            return next
          })
        }
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium"
      >
        <span className="inline-flex items-center gap-2">
          <MapPinned className="h-4 w-4 shrink-0 text-primary" />
          Tìm &amp; chọn địa chỉ trên bản đồ
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Gõ địa chỉ hoặc tên đường, chọn kết quả, có thể kéo ghim trên bản đồ rồi bấm &quot;Điền vào form&quot;. Hệ thống thử nhiều cách tách từ khóa và nguồn OSM bổ sung; nếu vẫn không có, thử bớt dấu phẩy hoặc gõ &quot;số nhà + tên đường + quận + tỉnh&quot;. © OpenStreetMap.
          </p>
          <div className="relative">
            <Input
              placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              className="pr-10"
            />
            {loadingSearch ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          {searchError ? <p className="text-xs text-destructive">{searchError}</p> : null}

          {!loadingSearch && query.trim().length >= 3 && results.length === 0 && !searchError ? (
            <p className="text-xs text-muted-foreground">
              Không có kết quả. Thử gõ lại không dấu phẩy giữa tên phường (vd: &quot;Khuê Mỹ&quot;), hoặc rút gọn: số nhà + đường + Ngũ Hành Sơn + Đà Nẵng.
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto rounded-md border border-border bg-background text-sm">
              {results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-secondary",
                      selected?.place_id === r.place_id && "bg-secondary",
                    )}
                    onClick={() => pickHit(r)}
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {mapReady ? (
            <div
              ref={mapRef}
              className="h-56 w-full overflow-hidden rounded-md border border-border"
              style={{ minHeight: "14rem" }}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Chọn một kết quả tìm kiếm để hiện bản đồ.</p>
          )}

          {preview ? (
            <div className="rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs">
              <p className="font-medium text-foreground">Xem trước điền form</p>
              <p className="mt-1 text-muted-foreground">
                Đường: {preview.address || "—"} · Phường/xã: {preview.ward || "—"} · Quận/huyện: {preview.district || "—"}{" "}
                · Tỉnh/TP: {preview.city || "—"}
              </p>
              {reverseLoading ? <p className="mt-1 text-muted-foreground">Đang cập nhật theo vị trí ghim…</p> : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={!selected || disabled} onClick={handleApply}>
              Điền vào form địa chỉ
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
