import { productService } from "@/services/product.service"

/** Resolve catalog product id from variant id (no dedicated backend endpoint). */
export async function findProductIdByVariantId(variantId: number): Promise<number | null> {
  const listRes = await productService.getPublicPage({ pageNum: 1, sizePage: 50 })
  const products = listRes.data.result?.data ?? []
  for (const summary of products) {
    const detailRes = await productService.getPublicById(summary.id)
    const variants = detailRes.data.result?.variants ?? []
    if (variants.some((v) => v.id === variantId)) {
      return summary.id
    }
  }
  return null
}
