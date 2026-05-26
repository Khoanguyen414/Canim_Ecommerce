/** Xóa nền trắng / xám / ô caro — giữ nguyên màu vàng logo. */
export function alphaForLogoBackground(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  const sat = max - min

  if (sat >= 28) return 1

  if (lum >= 250 && sat < 12) return 0

  if (sat < 22 && lum >= 165) {
    if (lum >= 235) return 0
    return Math.max(0, 1 - (lum - 165) / 70)
  }

  return 1
}

export function cleanLogoImageData(data: ImageData): void {
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    const a = alphaForLogoBackground(px[i], px[i + 1], px[i + 2])
    px[i + 3] = Math.round(px[i + 3] * a)
  }
}
