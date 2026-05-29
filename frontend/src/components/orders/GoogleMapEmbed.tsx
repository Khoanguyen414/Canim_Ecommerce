import { useEffect, useRef } from "react"
import { getGoogleMapsApiKey } from "@/lib/googleIdentity"

type Props = {
  latitude: number
  longitude: number
  className?: string
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          opts: { center: { lat: number; lng: number }; zoom: number },
        ) => unknown
        Marker: new (opts: { position: { lat: number; lng: number }; map: unknown }) => unknown
      }
    }
  }
}

/** Interactive map only when VITE_GOOGLE_MAPS_API_KEY is set. */
export function GoogleMapEmbed({ latitude, longitude, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const apiKey = getGoogleMapsApiKey()

  useEffect(() => {
    if (!apiKey || !ref.current) return

    let cancelled = false

    const loadMaps = () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.maps) {
          resolve()
          return
        }
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Maps script failed"))
        document.head.appendChild(script)
      })

    void loadMaps()
      .then(() => {
        if (cancelled || !ref.current || !window.google?.maps) return
        const map = new window.google.maps.Map(ref.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
        })
        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
        })
      })
      .catch(() => {
        // Fallback: parent can show link only
      })

    return () => {
      cancelled = true
    }
  }, [apiKey, latitude, longitude])

  if (!apiKey) return null

  return <div ref={ref} className={className} aria-label="Delivery map" />
}
