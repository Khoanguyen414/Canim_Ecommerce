/** Kết quả tìm kiếm địa chỉ (Nominatim / Photon) — cùng hình dạng để map + form dùng chung */
export type GeocodeHit = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: Record<string, string | undefined>
}
