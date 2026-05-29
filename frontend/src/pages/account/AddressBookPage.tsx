import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { addressService } from "@/services/address.service"
import { getVietnamAddressData, type VnDistrict, type VnProvince, type VnWard } from "@/services/vnAddress.service"
import { buildFullAddress } from "@/lib/buildFullAddress"
import { getApiErrorMessage } from "@/lib/apiError"
import type { UserAddressDto, UserAddressPayload } from "@/types/api.types"

type FormState = {
  receiverName: string
  receiverPhone: string
  streetAddress: string
  city: string
  district: string
  ward: string
  note: string
  isDefault: boolean
}

const emptyForm = (): FormState => ({
  receiverName: "",
  receiverPhone: "",
  streetAddress: "",
  city: "",
  district: "",
  ward: "",
  note: "",
  isDefault: false,
})

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<UserAddressDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<VnProvince[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await addressService.list()
      if (!res.success) throw new Error(res.message)
      setAddresses(res.result ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    void getVietnamAddressData().then(setProvinces).catch(() => {})
  }, [load])

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name === form.city),
    [provinces, form.city],
  )
  const districts: VnDistrict[] = selectedProvince?.districts ?? []
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.name === form.district),
    [districts, form.district],
  )
  const wards: VnWard[] = selectedDistrict?.wards ?? []

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (addr: UserAddressDto) => {
    setEditingId(addr.id)
    setForm({
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      streetAddress: addr.streetAddress,
      city: addr.provinceName ?? "",
      district: addr.districtName ?? "",
      ward: addr.wardName ?? "",
      note: addr.note ?? "",
      isDefault: Boolean(addr.isDefault),
    })
    setModalOpen(true)
  }

  const buildPayload = (): UserAddressPayload => {
    const province = provinces.find((p) => p.name === form.city)
    const district = province?.districts?.find((d) => d.name === form.district)
    const ward = district?.wards?.find((w) => w.name === form.ward)
    return {
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      provinceCode: province?.code != null ? String(province.code) : undefined,
      provinceName: form.city || undefined,
      districtCode: district?.code != null ? String(district.code) : undefined,
      districtName: form.district || undefined,
      wardCode: ward?.code != null ? String(ward.code) : undefined,
      wardName: form.ward || undefined,
      streetAddress: form.streetAddress.trim(),
      fullAddress: buildFullAddress({
        streetAddress: form.streetAddress,
        wardName: form.ward,
        districtName: form.district,
        provinceName: form.city,
      }),
      note: form.note.trim() || undefined,
      isDefault: form.isDefault,
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (editingId) {
        const res = await addressService.update(editingId, payload)
        if (!res.success) throw new Error(res.message)
      } else {
        const res = await addressService.create(payload)
        if (!res.success) throw new Error(res.message)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa địa chỉ này?")) return
    try {
      const res = await addressService.remove(id)
      if (!res.success) throw new Error(res.message)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      const res = await addressService.setDefault(id)
      if (!res.success) throw new Error(res.message)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Link to="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronLeft className="h-4 w-4" />
        Tài khoản
      </Link>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Sổ địa chỉ</h1>
        <Button type="button" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-muted-foreground">Đang tải...</p> : null}

      <ul className="space-y-3">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {addr.receiverName} · {addr.receiverPhone}
                  {addr.isDefault ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Mặc định</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{addr.fullAddress}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!addr.isDefault ? (
                  <Button type="button" variant="ghost" size="sm" title="Đặt mặc định" onClick={() => void handleSetDefault(addr.id)}>
                    <Star className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(addr)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(addr.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </ul>

      {!loading && addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có địa chỉ. Thêm địa chỉ để thanh toán nhanh hơn.</p>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <h2 className="text-lg font-bold">{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ"}</h2>
            <div className="mt-4 space-y-3">
              <Input placeholder="Họ tên người nhận" value={form.receiverName} onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))} />
              <Input placeholder="Số điện thoại" value={form.receiverPhone} onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value }))} />
              <Input placeholder="Số nhà, đường" value={form.streetAddress} onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))} />
              <Select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, district: "", ward: "" }))}>
                <option value="">Tỉnh / Thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </Select>
              <Select value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value, ward: "" }))} disabled={!form.city}>
                <option value="">Quận / Huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </Select>
              <Select value={form.ward} onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))} disabled={!form.district}>
                <option value="">Phường / Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </Select>
              <Input placeholder="Ghi chú (tuỳ chọn)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                Đặt làm địa chỉ mặc định
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="button" disabled={saving} onClick={() => void handleSave()}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
