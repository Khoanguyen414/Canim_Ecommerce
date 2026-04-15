export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

export function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0
  if (typeof value === "number") return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}
