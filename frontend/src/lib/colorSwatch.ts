/** Gán màu hiển thị cho nhãn màu từ API (tiếng Việt / Anh). */
export function resolveColorCss(label: string | null | undefined): string {
  if (!label?.trim()) return "hsl(220 14% 88%)"
  const key = label.toLowerCase().trim()

  const map: Record<string, string> = {
    đỏ: "#e11d48",
    red: "#e11d48",
    "đỏ đậm": "#991b1b",
    "đỏ tươi": "#f43f5e",
    xanh: "#16a34a",
    green: "#16a34a",
    "xanh lá": "#22c55e",
    "xanh dương": "#2563eb",
    blue: "#2563eb",
    navy: "#1e3a8a",
    "xanh ngọc": "#14b8a6",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    vàng: "#eab308",
    yellow: "#eab308",
    gold: "#d97706",
    cam: "#ea580c",
    orange: "#ea580c",
    hồng: "#db2777",
    pink: "#ec4899",
    tím: "#9333ea",
    purple: "#9333ea",
    violet: "#7c3aed",
    đen: "#171717",
    black: "#171717",
    trắng: "#fafafa",
    white: "#fafafa",
    kem: "#fde68a",
    beige: "#d4b896",
    nâu: "#78350f",
    brown: "#78350f",
    xám: "#6b7280",
    gray: "#6b7280",
    grey: "#6b7280",
    bạc: "#94a3b8",
    silver: "#94a3b8",
  }

  for (const [word, hex] of Object.entries(map)) {
    if (key.includes(word)) return hex
  }

  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i) * (i + 1)) % 360
  }
  return `hsl(${h} 62% 48%)`
}

export function uniqueVariantColorLabels(product: { variants?: { color?: string | null }[] }, max = 6): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of product.variants ?? []) {
    const c = v.color?.trim()
    if (!c || seen.has(c.toLowerCase())) continue
    seen.add(c.toLowerCase())
    out.push(c)
    if (out.length >= max) break
  }
  return out
}
