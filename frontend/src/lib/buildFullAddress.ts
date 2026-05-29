/** Build display full address from structured parts (Vietnam-style). */
export function buildFullAddress(parts: {
  streetAddress: string
  wardName?: string
  districtName?: string
  provinceName?: string
}): string {
  return [parts.streetAddress, parts.wardName, parts.districtName, parts.provinceName]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ")
}
