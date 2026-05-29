export function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const n = typeof value === "string" ? Number(value) : value
  return Number.isFinite(n) ? n : 0
}

export function formatVnd(amount: number | string): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(toNumber(amount))
}
