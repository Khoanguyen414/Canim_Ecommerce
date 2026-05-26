export type VnWard = {
  code: number
  name: string
}

export type VnDistrict = {
  code: number
  name: string
  wards: VnWard[]
}

export type VnProvince = {
  code: number
  name: string
  districts: VnDistrict[]
}

type RawWard = {
  code: number
  name: string
}

type RawDistrict = {
  code: number
  name: string
  wards?: RawWard[]
}

type RawProvince = {
  code: number
  name: string
  districts?: RawDistrict[]
}

const VIETNAM_ADDRESS_API = "https://provinces.open-api.vn/api/?depth=3"
const collator = new Intl.Collator("vi")

let cachedAddressPromise: Promise<VnProvince[]> | null = null

function normalizeWard(raw: RawWard): VnWard {
  return {
    code: raw.code,
    name: raw.name ?? "",
  }
}

function normalizeDistrict(raw: RawDistrict): VnDistrict {
  const wards = (raw.wards ?? [])
    .map(normalizeWard)
    .filter((w) => w.name.trim().length > 0)
    .sort((a, b) => collator.compare(a.name, b.name))

  return {
    code: raw.code,
    name: raw.name ?? "",
    wards,
  }
}

function normalizeProvince(raw: RawProvince): VnProvince {
  const districts = (raw.districts ?? [])
    .map(normalizeDistrict)
    .filter((d) => d.name.trim().length > 0)
    .sort((a, b) => collator.compare(a.name, b.name))

  return {
    code: raw.code,
    name: raw.name ?? "",
    districts,
  }
}

export async function getVietnamAddressData(): Promise<VnProvince[]> {
  if (!cachedAddressPromise) {
    cachedAddressPromise = fetch(VIETNAM_ADDRESS_API)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành.")
        }
        const data = (await res.json()) as RawProvince[]
        if (!Array.isArray(data)) return []

        return data
          .map(normalizeProvince)
          .filter((p) => p.name.trim().length > 0)
          .sort((a, b) => collator.compare(a.name, b.name))
      })
      .catch((err: unknown) => {
        cachedAddressPromise = null
        throw err
      })
  }

  return cachedAddressPromise
}
