import type { VnDistrict, VnProvince, VnWard } from "@/services/vnAddress.service"
import type { NominatimHit } from "@/lib/nominatimGeocode"

export type GeocodedFormParts = {
  address: string
  city: string
  district: string
  ward: string
}

/** Chuẩn hoá để so khớp tên tiếng Việt / Latin */
export function foldAscii(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim()
}

function stripAdminPrefix(name: string): string {
  return name
    .replace(/^(Phường|Ph\.|P\.|Xã|X\.|Thị trấn|TT\.|Huyện|H\.|Quận|Q\.|Thành phố|TP\.|Tỉnh|T\.)\s+/iu, "")
    .trim()
}

function provinceVariants(name: string): string[] {
  const n = name.trim()
  const set = new Set<string>([n, stripAdminPrefix(n)])
  const f = foldAscii(n)
  if (f.includes("ho chi minh") || f.includes("hochiminh")) {
    set.add("Ho Chi Minh City")
    set.add("Ho Chi Minh")
    set.add("Hồ Chí Minh")
    set.add("Thanh pho Ho Chi Minh")
  }
  if (f.includes("ha noi") || f === "ha noi") {
    set.add("Hà Nội")
    set.add("Hanoi")
  }
  return [...set].filter((s) => s.length >= 2)
}

function districtVariants(name: string): string[] {
  const n = name.trim()
  return [...new Set([n, stripAdminPrefix(n)])].filter((s) => s.length >= 2)
}

function wardVariants(name: string): string[] {
  const n = name.trim()
  return [...new Set([n, stripAdminPrefix(n)])].filter((s) => s.length >= 2)
}

export function streetLineFromHit(hit: NominatimHit): string {
  const addr = hit.address ?? {}
  const hn = addr.house_number?.trim() ?? ""
  const road =
    addr.road?.trim() ??
    addr.pedestrian?.trim() ??
    addr.residential?.trim() ??
    addr.neighbourhood?.trim() ??
    ""
  const line = [hn, road].filter(Boolean).join(" ").trim()
  if (line) return line
  const first = hit.display_name?.split(",").map((s) => s.trim())[0]
  return first ?? ""
}

function bestMatchByFoldedIncludes<T extends { name: string }>(
  items: T[],
  variants: (item: T) => string[],
  haystack: string,
): T | null {
  let best: T | null = null
  let bestLen = 0
  for (const item of items) {
    for (const v of variants(item)) {
      const f = foldAscii(v)
      if (f.length < 2) continue
      if (haystack.includes(f) && f.length > bestLen) {
        bestLen = f.length
        best = item
      }
    }
  }
  return best
}

/**
 * Cố gắng khớp tỉnh / quận / phường với danh sách provinces.open-api.vn.
 * Nếu OSM trả tên khác, có thể chỉ điền được một phần — người dùng chỉnh dropdown.
 */
export function matchHitToVnForm(hit: NominatimHit, provinces: VnProvince[]): GeocodedFormParts {
  const display = hit.display_name ?? ""
  const haystack = foldAscii(display)
  const addr = hit.address ?? {}

  const province = bestMatchByFoldedIncludes(
    provinces,
    (p) => provinceVariants(p.name),
    haystack,
  )

  const districts: VnDistrict[] = province?.districts ?? []
  const district = bestMatchByFoldedIncludes(districts, (d) => districtVariants(d.name), haystack)

  const wards: VnWard[] = district?.wards ?? []
  const ward = bestMatchByFoldedIncludes(wards, (w) => wardVariants(w.name), haystack)

  const street = streetLineFromHit(hit)

  return {
    address: street,
    city: province?.name ?? (addr.state?.trim() || addr.city?.trim() || ""),
    district: district?.name ?? (addr.city_district?.trim() || addr.county?.trim() || ""),
    ward: ward?.name ?? (addr.suburb?.trim() || addr.quarter?.trim() || addr.neighbourhood?.trim() || ""),
  }
}

function findProvinceByLooseName(provinces: VnProvince[], label: string): VnProvince | null {
  const t = label.trim()
  if (!t) return null
  const exact = provinces.find((p) => p.name === t)
  if (exact) return exact
  const f0 = foldAscii(t)
  const byFold = provinces.find((p) => foldAscii(p.name) === f0)
  if (byFold) return byFold
  let best: VnProvince | null = null
  let bestLen = 0
  for (const p of provinces) {
    for (const v of provinceVariants(p.name)) {
      const f = foldAscii(v)
      if (f.length < 3) continue
      if ((f0.includes(f) || f.includes(f0)) && f.length > bestLen) {
        bestLen = f.length
        best = p
      }
    }
  }
  return best
}

function findDistrictByLooseName(districts: VnDistrict[], label: string): VnDistrict | null {
  const t = label.trim()
  if (!t) return null
  const exact = districts.find((d) => d.name === t)
  if (exact) return exact
  const f0 = foldAscii(t)
  const byFold = districts.find((d) => foldAscii(d.name) === f0)
  if (byFold) return byFold
  let best: VnDistrict | null = null
  let bestLen = 0
  for (const d of districts) {
    for (const v of districtVariants(d.name)) {
      const f = foldAscii(v)
      if (f.length < 2) continue
      if ((f0.includes(f) || f.includes(f0)) && f.length > bestLen) {
        bestLen = f.length
        best = d
      }
    }
  }
  return best
}

function findWardByLooseName(wards: VnWard[], label: string): VnWard | null {
  const t = label.trim()
  if (!t) return null
  const exact = wards.find((w) => w.name === t)
  if (exact) return exact
  const f0 = foldAscii(t)
  const byFold = wards.find((w) => foldAscii(w.name) === f0)
  if (byFold) return byFold
  let best: VnWard | null = null
  let bestLen = 0
  for (const w of wards) {
    for (const v of wardVariants(w.name)) {
      const f = foldAscii(v)
      if (f.length < 2) continue
      if ((f0.includes(f) || f.includes(f0)) && f.length > bestLen) {
        bestLen = f.length
        best = w
      }
    }
  }
  return best
}

/**
 * Ép city / district / ward trùng đúng `name` trong provinces.open-api.vn.
 * Tránh `<select>` controlled với value không có trong `<option>` → không đổi được tỉnh/huyện/xã.
 */
export function alignPartsToVnCatalog(
  parts: GeocodedFormParts,
  provinces: VnProvince[],
): GeocodedFormParts {
  if (!provinces.length) return parts

  const province = findProvinceByLooseName(provinces, parts.city)
  if (!province) {
    return {
      address: parts.address.trim(),
      city: "",
      district: "",
      ward: "",
    }
  }

  const district = findDistrictByLooseName(province.districts, parts.district)
  if (!district) {
    return {
      address: parts.address.trim(),
      city: province.name,
      district: "",
      ward: "",
    }
  }

  const ward = findWardByLooseName(district.wards, parts.ward)

  return {
    address: parts.address.trim(),
    city: province.name,
    district: district.name,
    ward: ward?.name ?? "",
  }
}
