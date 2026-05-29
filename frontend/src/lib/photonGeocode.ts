import type { GeocodeHit } from "@/lib/geocodeHit"

/** bbox Việt Nam (minLon, minLat, maxLon, maxLat) — lọc kết quả Photon */
const VN_BBOX = "102.05,7.5,109.55,23.55"

type PhotonFeature = {
  geometry?: { type?: string; coordinates?: [number, number] }
  properties?: Record<string, string | number | undefined>
}

type PhotonResponse = { features?: PhotonFeature[] }

function buildDisplayName(p: Record<string, string | number | undefined>): string {
  const housenumber = String(p.housenumber ?? "").trim()
  const street = String(p.street ?? "").trim()
  const name = String(p.name ?? "").trim()
  const locality = String(p.locality ?? "").trim()
  const district = String(p.district ?? "").trim()
  const city = String(p.city ?? "").trim()
  const state = String(p.state ?? "").trim()
  const country = String(p.country ?? "").trim()
  const line1 = [housenumber, street || name].filter(Boolean).join(" ").trim()
  const tail = [locality, district, city, state, country].filter(Boolean).join(", ")
  const base = line1 || name
  return tail ? `${base}, ${tail}` : base || "Vietnam"
}

function photonPropsToAddress(p: Record<string, string | number | undefined>): Record<string, string | undefined> {
  const s = (v: unknown) => (v == null ? undefined : String(v).trim() || undefined)
  return {
    house_number: s(p.housenumber),
    road: s(p.street) ?? s(p.name),
    suburb: s(p.locality) ?? s(p.district),
    city_district: s(p.district),
    city: s(p.city),
    state: s(p.state),
    country: s(p.country),
  }
}

/**
 * Photon (Komoot) — dữ liệu OSM, thường bổ sung kết quả mà Nominatim bỏ sót.
 * https://photon.komoot.io/
 */
export async function searchPhotonVietnam(q: string, signal?: AbortSignal): Promise<GeocodeHit[]> {
  const trimmed = q.trim()
  if (trimmed.length < 2) return []

  const params = new URLSearchParams({
    q: trimmed,
    limit: "12",
    lang: "vi",
    bbox: VN_BBOX,
  })
  const url = `https://photon.komoot.io/api/?${params.toString()}`
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } })
  if (!res.ok) return []
  const data = (await res.json()) as PhotonResponse
  const features = data.features ?? []

  return features
    .map((f, idx) => {
      const coords = f.geometry?.coordinates
      if (!coords || coords.length < 2) return null
      const [lon, lat] = coords
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
      const p = f.properties ?? {}
      const osmId = typeof p.osm_id === "number" ? p.osm_id : idx
      const type = String(p.osm_type ?? "x")
      const place_id = -(Math.abs(osmId % 1_000_000_000) * 10 + type.charCodeAt(0) + idx)

      return {
        place_id,
        lat: String(lat),
        lon: String(lon),
        display_name: buildDisplayName(p),
        address: photonPropsToAddress(p),
      } satisfies GeocodeHit
    })
    .filter((x): x is GeocodeHit => x != null)
}
