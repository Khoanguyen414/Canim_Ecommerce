import { api } from "@/lib/http"

const PRODUCT_ENDPOINT = "/products"

export const productService = {
  getProducts(params: Record<string, unknown> = {}) {
    return api.get(PRODUCT_ENDPOINT, { params })
  },

  /** Ẩn khỏi shop — đặt trạng thái HIDDEN (soft delete). */
  hideProduct(id: number | string) {
    return api.delete(`${PRODUCT_ENDPOINT}/${id}`, { params: { permanent: false } })
  },

  /** Xóa hẳn khỏi database (chỉ dùng cho sản phẩm đã HIDDEN). */
  permanentlyDeleteProduct(id: number | string) {
    return api.delete(`${PRODUCT_ENDPOINT}/${id}`, { params: { permanent: true } })
  },

  /** Khôi phục sản phẩm HIDDEN → ACTIVE (hiển thị lại trên shop). */
  restoreProduct(id: number | string) {
    return api.post(`${PRODUCT_ENDPOINT}/${id}/restore`)
  },

  getProductById(id: number | string) {
    return api.get(`${PRODUCT_ENDPOINT}/${id}`)
  },

  createProduct(payload: unknown) {
    return api.post(PRODUCT_ENDPOINT, payload)
  },

  updateProduct(id: number | string, payload: unknown) {
    return api.put(`${PRODUCT_ENDPOINT}/${id}`, payload)
  },

  updateStatus(id: number | string, status: string) {
    return api.patch(`${PRODUCT_ENDPOINT}/${id}/status`, { status })
  },


  getCategories() {
    return api.get("/categories")
  },

  uploadImages(productId: number | string, files: File[]) {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    return api.post(`${PRODUCT_ENDPOINT}/${productId}/images`, formData)
  },
}
