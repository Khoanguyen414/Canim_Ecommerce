import { paymentQrConfig } from "@/config/payment-qr.config"

/** Dự phòng khi API lỗi — cùng logic URL với backend (img.vietqr.io). */
export function buildVietQrImageUrl(params: {
  acquirerId: string
  accountNumber: string
  template?: string
  amountVnd: number
  transferContent: string
  accountName: string
}): string {
  const account = params.accountNumber.replace(/\s+/g, "")
  const tpl = params.template ?? paymentQrConfig.vietqr.template
  const amount = Math.max(0, Math.round(params.amountVnd))
  if (!params.acquirerId || !account || amount <= 0) return ""

  const q = new URLSearchParams()
  q.set("amount", String(amount))
  if (params.transferContent) q.set("addInfo", params.transferContent)
  if (params.accountName) q.set("accountName", params.accountName)

  return `https://img.vietqr.io/image/${params.acquirerId.trim()}-${account}-${tpl}.jpg?${q.toString()}`
}

export function normalizeMomoPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) return `84${digits.slice(1)}`
  if (!digits.startsWith("84")) return `84${digits}`
  return digits
}
