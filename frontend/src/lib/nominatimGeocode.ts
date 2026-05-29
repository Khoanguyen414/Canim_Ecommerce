/**
 * OpenStreetMap Nominatim (+ fallback Photon) — dùng tần suất vừa phải.
 * Production: nên proxy qua backend và tuân thủ https://operations.osmfoundation.org/policies/nominatim/
 */

import type { GeocodeHit } from "@/lib/geocodeHit"
import { searchPhotonVietnam } from "@/lib/photonGeocode"

export type NominatimHit = GeocodeHit

const BASE = "https://nominatim.openstreetmap.org"
const COMMON_PARAMS = "format=jsonv2&addressdetails=1&countrycodes=vn"

function nominatimHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "vi,en;q=0.9",
  }
}

export function normalizeGeocodeQuery(q: string): string {
  return q
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,/g, ", ")
    .trim()
}

/** Nhiều cách gõ (dấu phẩy / từ khóa rút gọn) để tăng khả năng trúng Nominatim */
export function buildGeocodeQueryVariants(raw: string): string[] {
  const n = normalizeGeocodeQuery(raw)
  const out: string[] = []
  const add = (s: string) => {
    const t = s.trim()
    if (t.length >= 3 && !out.includes(t)) out.push(t)
  }

  add(n)
  // "14 Đường X, Phường Y, ..." -> bỏ dấu phẩy (tránh tách nhầm tên phường như "Khuê, Mỹ")
  if (n.includes(",")) {
    add(n.replace(/,/g, " ").replace(/\s+/g, " "))
  }

  const parts = n.split(",").map((p) => p.trim()).filter((p) => p.length > 0)
  if (parts.length >= 2) {
    for (let k = parts.length; k >= 1; k--) {
      add(parts.slice(0, k).join(", "))
      add(parts.slice(0, k).join(" "))
    }
  }

  return out.slice(0, 10)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }
    const id = window.setTimeout(() => resolve(), ms)
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id)
        reject(new DOMException("Aborted", "AbortError"))
      },
      { once: true },
    )
  })
}

export async function searchVietnam(q: string, signal?: AbortSignal): Promise<GeocodeHit[]> {
  const trimmed = q.trim()
  if (trimmed.length < 2) return []

  const url = `${BASE}/search?${COMMON_PARAMS}&limit=10&q=${encodeURIComponent(trimmed)}`
  const res = await fetch(url, { signal, headers: nominatimHeaders() })
  if (!res.ok) throw new Error("Không tìm được địa chỉ (Nominatim).")
  const data = (await res.json()) as unknown
  return Array.isArray(data) ? (data as GeocodeHit[]) : []
}

/**
 * Thử Nominatim với vài biến thể câu hỏi (tuần tự, nghỉ ~1s theo khuyến nghị OSM);
 * nếu vẫn trống thì gọi Photon (cùng nguồn OSM, thường khác ranking).
 */
export async function searchVietnamWithFallbacks(q: string, signal?: AbortSignal): Promise<GeocodeHit[]> {
  const variants = buildGeocodeQueryVariants(q)
  const merged: GeocodeHit[] = []
  const seen = new Set<string>()

  const addHits = (hits: GeocodeHit[]) => {
    for (const h of hits) {
      const key = `${h.lat},${h.lon},${(h.display_name ?? "").slice(0, 56)}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(h)
    }
  }

  let first = true
  for (const v of variants) {
    if (signal?.aborted) break
    if (!first) {
      try {
        await sleep(1050, signal)
      } catch {
        break
      }
    }
    first = false
    try {
      const hits = await searchVietnam(v, signal)
      addHits(hits)
      if (merged.length >= 10) break
    } catch {
      /* thử variant tiếp */
    }
  }

  if (merged.length === 0 && !signal?.aborted) {
    try {
      const photon = await searchPhotonVietnam(normalizeGeocodeQuery(q), signal)
      addHits(photon)
    } catch {
      /* ignore */
    }
  } else if (merged.length < 6 && !signal?.aborted) {
    try {
      await sleep(400, signal)
      const photon = await searchPhotonVietnam(normalizeGeocodeQuery(q), signal)
      addHits(photon)
    } catch {
      /* ignore */
    }
  }

  return merged.slice(0, 14)
}

export async function reverseVietnam(lat: number, lon: number, signal?: AbortSignal): Promise<GeocodeHit | null> {
  const url = `${BASE}/reverse?${COMMON_PARAMS}&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
  const res = await fetch(url, { signal, headers: nominatimHeaders() })
  if (!res.ok) return null
  const data = (await res.json()) as GeocodeHit & { error?: string }
  if (data && typeof data === "object" && "error" in data && data.error) return null
  return data as GeocodeHit
}
