/** Alpha 0–1: 0 = nền trong suốt (trắng, xám, ô caro checkerboard). */
export function alphaForLogoBackground(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  const sat = max - min

  if (lum >= 248 && sat < 18) return 0
  if (sat < 24 && lum >= 168) {
    if (lum >= 228) return 0
    return Math.max(0, 1 - (lum - 168) / 60)
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
