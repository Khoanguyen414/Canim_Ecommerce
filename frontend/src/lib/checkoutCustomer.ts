export type CustomerFormFields = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCustomerForm(f: CustomerFormFields): Record<string, string> {
  const err: Record<string, string> = {}
  if (!f.fullName.trim()) err.fullName = "Vui lòng nhập họ và tên."
  if (!f.phone.trim()) err.phone = "Vui lòng nhập số điện thoại."
  else if (f.phone.replace(/\D/g, "").length < 9) err.phone = "Số điện thoại không hợp lệ (ít nhất 9 chữ số)."
  if (!f.address.trim()) err.address = "Vui lòng nhập địa chỉ (số nhà, đường)."
  if (!f.ward.trim()) err.ward = "Vui lòng nhập phường / xã."
  if (!f.district.trim()) err.district = "Vui lòng nhập quận / huyện."
  if (!f.city.trim()) err.city = "Vui lòng nhập tỉnh / thành phố."
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) err.email = "Email không đúng định dạng."
  return err
}

export function deliverySummaryFromCustomer(f: CustomerFormFields): string {
  return [f.fullName, f.phone, f.address, f.ward, f.district, f.city]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ")
}
