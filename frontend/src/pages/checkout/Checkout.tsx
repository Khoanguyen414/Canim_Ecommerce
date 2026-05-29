import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MapPin, CreditCard, Truck } from "lucide-react"
import { useCartStore } from "@/store/cart.store"
import { useAuthStore } from "@/store/auth.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingCart } from "lucide-react"
import { deliverySummaryFromCustomer, validateCustomerForm } from "@/lib/checkoutCustomer"
import { cn } from "@/lib/cn"
import { getVietnamAddressData, type VnDistrict, type VnProvince, type VnWard } from "@/services/vnAddress.service"
import { orderService } from "@/services/order.service"
import { addressService } from "@/services/address.service"
import {
  SavedAddressPicker,
  type AddressCheckoutMode,
} from "@/components/checkout/SavedAddressPicker"
import type { UserAddressDto } from "@/types/api.types"
import { syncLocalCartToServer } from "@/lib/cartSync"
import { getApiErrorMessage } from "@/lib/apiError"
import { shippingAddressFromParts } from "@/lib/orderLabels"
import type { PaymentMethod } from "@/types/api.types"

export default function Checkout() {
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCartStore()
  const user = useAuthStore((s) => s.user)

  const [formData, setFormData] = useState(() => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "VNPAY_QR" as PaymentMethod,
  }))
  const [shippingId, setShippingId] = useState("standard")
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [provinces, setProvinces] = useState<VnProvince[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<UserAddressDto[]>([])
  const [addressMode, setAddressMode] = useState<AddressCheckoutMode>("manual")
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  const shippingOptions = useMemo(
    () => [
      { id: "fast", name: "Giao hàng nhanh (1–2 ngày)", price: 50000 },
      { id: "standard", name: "Giao hàng tiêu chuẩn (3–5 ngày)", price: 30000 },
      { id: "economy", name: "Giao hàng tiết kiệm (5–7 ngày)", price: 15000 },
    ],
    [],
  )

  const shippingFee = shippingOptions.find((s) => s.id === shippingId)?.price ?? 30000
  const shippingChosen = shippingOptions.find((s) => s.id === shippingId)
  const estimatedTotal = subtotal() + shippingFee
  const selectedProvince = useMemo(
    () => provinces.find((province) => province.name === formData.city),
    [provinces, formData.city],
  )
  const districts: VnDistrict[] = selectedProvince?.districts ?? []
  const selectedDistrict = useMemo(
    () => districts.find((district) => district.name === formData.district),
    [districts, formData.district],
  )
  const wards: VnWard[] = selectedDistrict?.wards ?? []

  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }))
  }, [user])

  useEffect(() => {
    if (!user) return
    void addressService.list().then((res) => {
      if (!res.success || !res.result?.length) return
      setSavedAddresses(res.result)
      const def = res.result.find((a) => a.isDefault)
      if (def) {
        setAddressMode("default")
        setSelectedAddressId(def.id)
        setFormData((prev) => ({
          ...prev,
          fullName: def.receiverName,
          phone: def.receiverPhone,
        }))
      }
    })
  }, [user])

  useEffect(() => {
    let mounted = true
    setLoadingLocations(true)
    setLocationError(null)
    void getVietnamAddressData()
      .then((data) => {
        if (!mounted) return
        setProvinces(data)
      })
      .catch(() => {
        if (!mounted) return
        setLocationError("Không tải được dữ liệu địa chỉ. Bạn có thể nhập thủ công.")
      })
      .finally(() => {
        if (!mounted) return
        setLoadingLocations(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const clearFieldErrors = (...keys: string[]) => {
    setFormErrors((prev) => {
      const next = { ...prev }
      keys.forEach((key) => {
        delete next[key]
      })
      return next
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value
    setFormData((prev) => ({ ...prev, city, district: "", ward: "" }))
    clearFieldErrors("city", "district", "ward")
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value
    setFormData((prev) => ({ ...prev, district, ward: "" }))
    clearFieldErrors("district", "ward")
  }

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ward = e.target.value
    setFormData((prev) => ({ ...prev, ward }))
    clearFieldErrors("ward")
  }

  const handlePlaceOrder = async () => {
    if (!lines.length) return

    if (addressMode === "manual") {
      const errs = validateCustomerForm({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
      })
      setFormErrors(errs)
      if (Object.keys(errs).length > 0) return
    } else if (addressMode === "saved" && !selectedAddressId) {
      setFormErrors({ submit: "Vui lòng chọn địa chỉ đã lưu." })
      return
    }

    setSubmitting(true)
    setFormErrors({})
    try {
      await syncLocalCartToServer(lines)

      const note = shippingChosen
        ? `Vận chuyển: ${shippingChosen.name}. ${formData.email ? `Email: ${formData.email.trim()}` : ""}`.trim()
        : undefined

      let checkoutPayload: Parameters<typeof orderService.checkout>[0]

      if (addressMode === "default") {
        checkoutPayload = {
          useDefaultAddress: true,
          orderNote: note,
          paymentMethod: formData.paymentMethod,
          shippingMethodId: shippingId,
          shippingFee,
          idempotencyKey: crypto.randomUUID(),
        }
      } else if (addressMode === "saved" && selectedAddressId) {
        checkoutPayload = {
          addressId: selectedAddressId,
          orderNote: note,
          paymentMethod: formData.paymentMethod,
          shippingMethodId: shippingId,
          shippingFee,
          idempotencyKey: crypto.randomUUID(),
        }
      } else {
        const shippingAddress = shippingAddressFromParts({
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        })
        checkoutPayload = {
          receiverName: formData.fullName.trim(),
          receiverPhone: formData.phone.trim(),
          shippingAddress,
          orderNote: note,
          paymentMethod: formData.paymentMethod,
          shippingMethodId: shippingId,
          shippingFee,
          idempotencyKey: crypto.randomUUID(),
        }
      }

      const checkoutRes = await orderService.checkout(checkoutPayload)

      if (!checkoutRes.success || !checkoutRes.result) {
        throw new Error(checkoutRes.message ?? "Đặt hàng thất bại")
      }

      const order = checkoutRes.result
      clear()

      if (formData.paymentMethod === "COD") {
        navigate(`/orders/${order.id}/confirm`)
        return
      }

      if (formData.paymentMethod === "VNPAY_QR") {
        navigate(`/orders/${order.id}/qr-pay`)
        return
      }
    } catch (err) {
      setFormErrors({ submit: getApiErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  if (!lines.length) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Giỏ hàng trống"
          description="Không thể thanh toán khi chưa có sản phẩm."
          actionLabel="Xem sản phẩm"
          onAction={() => navigate("/products")}
        />
      </div>
    )
  }

  const fieldClass = (name: keyof typeof formData) =>
    cn(formErrors[name as string] && "border-destructive focus-visible:ring-destructive/30")

  return (
    <div className="container py-8">
      <h1 className="mb-4 text-3xl font-bold">Thanh toán</h1>
      <p className="mb-8 rounded-lg border border-blue-200/80 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        Chọn <strong>Chuyển khoản QR</strong> để quét mã VietQR — hệ thống tự gắn số tiền và mã đơn (xem{" "}
        <code className="rounded bg-white/60 px-1">docs/HUONG_DAN_THANH_TOAN_QR_CA_NHAN.md</code>).
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 ? (
                <SavedAddressPicker
                  addresses={savedAddresses}
                  mode={addressMode}
                  selectedAddressId={selectedAddressId}
                  onModeChange={(mode) => {
                    setAddressMode(mode)
                    if (mode === "default") {
                      const def = savedAddresses.find((a) => a.isDefault)
                      if (def) setSelectedAddressId(def.id)
                    }
                  }}
                  onSelectAddress={(id) => {
                    setSelectedAddressId(id)
                    const addr = savedAddresses.find((a) => a.id === id)
                    if (addr) {
                      setFormData((prev) => ({
                        ...prev,
                        fullName: addr.receiverName,
                        phone: addr.receiverPhone,
                      }))
                    }
                  }}
                />
              ) : null}
              <p className="text-xs text-muted-foreground">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => navigate("/account/addresses")}
                >
                  Quản lý sổ địa chỉ
                </button>
              </p>
              {Object.keys(formErrors).length > 0 ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <p className="font-semibold">Vui lòng điền đủ thông tin giao hàng:</p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-5">
                    {Object.entries(formErrors).map(([k, msg]) => (
                      <li key={k}>
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {addressMode === "manual" ? (
              <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Input
                    placeholder="Họ và tên *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={fieldClass("fullName")}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Email (tuỳ chọn)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldClass("email")}
                    autoComplete="email"
                  />
                </div>
              </div>
              <Input
                placeholder="Số điện thoại *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={fieldClass("phone")}
                autoComplete="tel"
              />
              <Input
                placeholder="Địa chỉ (số nhà, đường) *"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={fieldClass("address")}
                autoComplete="street-address"
              />
              {locationError ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      placeholder="Phường / Xã *"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className={fieldClass("ward")}
                    />
                    <Input
                      placeholder="Quận / Huyện *"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={fieldClass("district")}
                    />
                    <Input
                      placeholder="Tỉnh / Thành *"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={fieldClass("city")}
                    />
                  </div>
                  <p className="text-sm text-destructive">{locationError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Select
                    name="ward"
                    value={formData.ward}
                    onChange={handleWardChange}
                    disabled={loadingLocations || !formData.city || !formData.district}
                    className={fieldClass("ward")}
                  >
                    <option value="">
                      {loadingLocations ? "Đang tải phường / xã..." : "Chọn phường / xã *"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={loadingLocations || !formData.city}
                    className={fieldClass("district")}
                  >
                    <option value="">
                      {loadingLocations ? "Đang tải quận / huyện..." : "Chọn quận / huyện *"}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    name="city"
                    value={formData.city}
                    onChange={handleProvinceChange}
                    disabled={loadingLocations}
                    className={fieldClass("city")}
                  >
                    <option value="">{loadingLocations ? "Đang tải tỉnh / thành..." : "Chọn tỉnh / thành *"}</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" />
                Vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shippingOptions.map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === method.id}
                    onChange={() => setShippingId(method.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{formatVnd(method.price)}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "VNPAY_QR" as PaymentMethod, name: "Chuyển khoản QR (VietQR)" },
                { id: "COD" as PaymentMethod, name: "Thanh toán khi nhận hàng (COD)" },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                  />
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 space-y-4 p-6">
            <h2 className="text-xl font-bold">Đơn hàng</h2>
            <div className="max-h-56 space-y-2 overflow-y-auto text-sm">
              {lines.map((l) => (
                <div key={l.lineId} className="flex justify-between gap-2">
                  <span className="line-clamp-2">
                    {l.productName} × {l.quantity}
                  </span>
                  <span className="shrink-0">{formatVnd(l.price * l.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Phí ship thực tế do server tính khi đặt hàng (mặc định 30.000đ).
              </p>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
              <span>Tổng (ước tính)</span>
              <span className="text-primary">{formatVnd(estimatedTotal)}</span>
            </div>
            {formErrors.submit ? (
              <p className="text-sm text-destructive">{formErrors.submit}</p>
            ) : null}
            <Button className="h-11 w-full" type="button" disabled={submitting} onClick={() => void handlePlaceOrder()}>
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Sau khi đặt hàng, bạn có thể xem lại thông tin nhận hàng và chỉnh sửa nếu cần trên trang xác nhận.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
