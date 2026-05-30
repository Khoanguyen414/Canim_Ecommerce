import { useCallback, useEffect, useMemo, useState } from "react"
import { ProductTable } from "./ProductTable"
import { ProductFormModal } from "./ProductFormModal"
import { productService } from "@/services/product.service"
import { inventoryService } from "@/services/inventory.service"
import { getApiErrorMessage } from "@/lib/apiError"
import { buildInitialInboundItems, formatInboundSummary } from "@/lib/productInbound"
import {
  buildCreateVariantsPayload,
  buildVariantPreviews,
  computeVariantSummary,
  validateCreateProductForm,
} from "@/lib/productVariants"

const PAGE_SIZE = 10

function flattenCategories(nodes, acc = []) {
  if (!Array.isArray(nodes)) return acc
  nodes.forEach((node) => {
    acc.push({ id: node.id, name: node.name })
    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenCategories(node.children, acc)
    }
  })
  return acc
}

function mapProduct(raw) {
  return {
    id: raw.id,
    name: raw.name || "",
    slug: raw.slug || "",
    shortDesc: raw.shortDesc || "",
    longDesc: raw.longDesc || "",
    brand: raw.brand || "",
    status: raw.status || "INACTIVE",
    createdAt: raw.createdAt || "",
    updatedAt: raw.updatedAt || "",
    category: {
      id: raw.categoryId || raw.category?.id || null,
      name: raw.categoryName || raw.category?.name || "",
    },
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    images: Array.isArray(raw.images) ? raw.images : [],
  }
}

function buildCreatePayload(formData) {
  const variants = buildCreateVariantsPayload({
    name: formData.name,
    categoryId: formData.categoryId,
    variantPrice: formData.variantPrice,
    colors: formData.colors ?? [],
    selectedSizes: formData.selectedSizes ?? [],
    stockMatrix: formData.stockMatrix ?? {},
  })

  return {
    name: formData.name.trim(),
    shortDesc: formData.shortDesc?.trim() || "",
    longDesc: formData.longDesc?.trim() || "",
    categoryId: Number(formData.categoryId),
    variants,
  }
}

function buildUpdatePayload(formData) {
  return {
    name: formData.name.trim(),
    shortDesc: formData.shortDesc?.trim() || "",
    longDesc: formData.longDesc?.trim() || "",
    categoryId: Number(formData.categoryId),
  }
}

function isHttpImageUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim())
}

function resolveProductId(apiBody) {
  const result = apiBody?.result
  if (result?.id != null) return result.id
  return null
}

async function imageUrlsToFiles(images) {
  const httpImages = images.filter((image) => isHttpImageUrl(image?.url))
  if (httpImages.length === 0) return []

  const sorted = [...httpImages].sort((a, b) => Number(Boolean(b.isMain)) - Number(Boolean(a.isMain)))
  const files = await Promise.all(
    sorted.map(async (image, index) => {
      const response = await fetch(image.url.trim())
      if (!response.ok) {
        throw new Error(`Cannot download image URL: ${image.url}`)
      }
      const blob = await response.blob()
      const extension = blob.type.split("/")[1] || "jpg"
      return new File([blob], `image-${Date.now()}-${index}.${extension}`, { type: blob.type || "image/jpeg" })
    }),
  )
  return files
}

/** Gộp file từ máy + ảnh URL (http/https) để upload một lần sau khi có productId. */
async function collectFilesForUpload(formData, existingImageUrls) {
  const existing = new Set(existingImageUrls)
  const fromDisk = (formData.uploadFiles || []).filter((f) => f && f.size > 0)

  const newUrlImages = (formData.images || []).filter((img) => img?.url && !existing.has(img.url) && isHttpImageUrl(img.url))
  const fromUrls = newUrlImages.length > 0 ? await imageUrlsToFiles(newUrlImages) : []

  return [...fromDisk, ...fromUrls]
}

export function ProductPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchInput, setSearchInput] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showHiddenProducts, setShowHiddenProducts] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await productService.getCategories()
      setCategories(flattenCategories(data.result || []))
    } catch {
      setCategories([])
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await productService.getProducts({
        pageNum: currentPage,
        sizePage: PAGE_SIZE,
        keyWord: searchKeyword || undefined,
        ...(showHiddenProducts
          ? { status: "HIDDEN", includeHidden: true }
          : { includeHidden: false }),
      })
      setProducts((data.result?.data || []).map(mapProduct))
      setTotalPages(Math.max(1, Number(data.result?.totalPages || 1)))
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Cannot load products"
      setError(message)
      setProducts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchKeyword, showHiddenProducts])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const openCreateModal = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const openEditModal = async (id) => {
    setError("")
    try {
      const { data } = await productService.getProductById(id)
      setSelectedProduct(mapProduct(data.result || {}))
      setShowModal(true)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Cannot load product detail"
      setError(message)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
  }

  const handleHide = async (id) => {
    if (!window.confirm("Ẩn sản phẩm khỏi cửa hàng?\n\nSản phẩm chuyển sang trạng thái HIDDEN và không hiển thị trên shop.")) {
      return
    }
    setError("")
    setSuccess("")
    try {
      await productService.hideProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setSuccess("Đã ẩn sản phẩm. Bạn có thể tiếp tục ẩn các sản phẩm khác. Chuyển sang tab «Sản phẩm đã ẩn» khi cần khôi phục hoặc xóa.")
    } catch (err) {
      setError(getApiErrorMessage(err, "Ẩn sản phẩm thất bại"))
    }
  }

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Xóa VĨNH VIỄN sản phẩm này?\n\nHành động không thể hoàn tác.")) {
      return
    }
    setError("")
    setSuccess("")
    try {
      await productService.permanentlyDeleteProduct(id)
      setSuccess("Đã xóa vĩnh viễn sản phẩm")
      await loadProducts()
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa vĩnh viễn thất bại"))
    }
  }

  const handleRestore = async (id) => {
    if (!window.confirm("Khôi phục sản phẩm?\n\nSản phẩm sẽ hiển thị lại trên cửa hàng (trạng thái ACTIVE).")) {
      return
    }
    setError("")
    setSuccess("")
    try {
      await productService.restoreProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setSuccess("Đã khôi phục sản phẩm — hiển thị lại trên web. Bạn có thể tiếp tục xử lý các sản phẩm đã ẩn khác.")
    } catch (err) {
      setError(getApiErrorMessage(err, "Khôi phục thất bại"))
    }
  }

  const handleSubmit = async (formData) => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      let productId = selectedProduct?.id || null
      let inboundSummary = null

      if (!productId) {
        const createSlice = {
          name: formData.name,
          categoryId: formData.categoryId,
          variantPrice: formData.variantPrice,
          colors: formData.colors ?? [],
          selectedSizes: formData.selectedSizes ?? [],
          stockMatrix: formData.stockMatrix ?? {},
          warehouseId: formData.warehouseId,
          supplierId: formData.supplierId,
        }
        const validationErrors = validateCreateProductForm(createSlice)
        const firstError = Object.values(validationErrors)[0]
        if (firstError) {
          throw new Error(firstError)
        }

        const variantSummary = computeVariantSummary(
          createSlice.colors,
          createSlice.selectedSizes,
          createSlice.stockMatrix,
        )
        const variantPreviews = buildVariantPreviews(
          formData.name,
          createSlice.colors,
          createSlice.selectedSizes,
          createSlice.stockMatrix,
        )

        const { data } = await productService.createProduct(buildCreatePayload(formData))
        productId = resolveProductId(data)
        if (!productId) {
          throw new Error("Tạo sản phẩm thành công nhưng không nhận được ID — không thể upload ảnh.")
        }

        if (variantSummary.totalStock > 0) {
          const createdVariants = data?.result?.variants ?? []
          const unitPrice = Number(formData.variantPrice)
          const inboundItems = buildInitialInboundItems(
            createdVariants,
            variantPreviews,
            Number.isFinite(unitPrice) ? unitPrice : 0,
          )

          if (inboundItems.length === 0) {
            throw new Error(
              "Sản phẩm đã tạo nhưng không map được biến thể để nhập kho — kiểm tra SKU hoặc nhập kho thủ công.",
            )
          }

          const inboundRes = await inventoryService.inbound({
            warehouseId: Number(formData.warehouseId),
            supplierId: Number(formData.supplierId),
            note:
              formData.inboundNote?.trim() ||
              `Nhập kho lúc tạo sản phẩm: ${formData.name.trim()}`,
            items: inboundItems,
          })

          if (!inboundRes.data?.success) {
            throw new Error(
              inboundRes.data?.message ??
                `Sản phẩm đã tạo (ID ${productId}) nhưng nhập kho thất bại — dùng Phiếu nhập kho để nhập thủ công.`,
            )
          }

          inboundSummary = formatInboundSummary(inboundItems)
        }
      } else {
        await productService.updateProduct(productId, buildUpdatePayload(formData))
      }

      // Chỉ đổi status khi sửa — tránh gọi PATCH thừa lúc tạo mới (dễ làm gián đoạn luồng upload)
      if (selectedProduct && productId && selectedProduct.status !== formData.status) {
        await productService.updateStatus(productId, formData.status)
      }

      const uploadErrors = []
      const existingUrls = (selectedProduct?.images || []).map((img) => img.url)
      const hasPendingImages =
        (formData.uploadFiles?.length ?? 0) > 0 ||
        (formData.images || []).some((img) => img?.url && !existingUrls.includes(img.url))

      if (productId && hasPendingImages) {
        try {
          const filesToUpload = await collectFilesForUpload(formData, existingUrls)
          if (filesToUpload.length === 0) {
            uploadErrors.push(
              "Không có file ảnh hợp lệ để upload (chọn file từ máy hoặc URL https trực tiếp, không dùng blob/Drive).",
            )
          } else {
            await productService.uploadImages(productId, filesToUpload)
          }
        } catch (err) {
          uploadErrors.push(getApiErrorMessage(err))
        }
      }

      const isEdit = Boolean(selectedProduct)
      if (uploadErrors.length > 0) {
        setError(
          `Sản phẩm đã ${isEdit ? "cập nhật" : "tạo"} (ID ${productId})${inboundSummary ? `, đã nhập kho (${inboundSummary})` : ""} nhưng upload ảnh thất bại: ${uploadErrors.join(" | ")}`,
        )
        setSuccess(null)
      } else if (
        (formData.uploadFiles?.length > 0 || formData.images?.length > 0) &&
        productId
      ) {
        setSuccess(
          isEdit
            ? "Cập nhật sản phẩm và upload ảnh thành công"
            : inboundSummary
              ? `Tạo sản phẩm, nhập kho (${inboundSummary}) và upload ảnh thành công`
              : "Tạo sản phẩm và upload ảnh thành công",
        )
      } else {
        setSuccess(
          isEdit
            ? "Cập nhật sản phẩm thành công"
            : inboundSummary
              ? `Tạo sản phẩm và nhập kho thành công (${inboundSummary})`
              : "Tạo sản phẩm thành công",
        )
      }
      if (uploadErrors.length === 0) {
        closeModal()
      }
      await loadProducts()
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Save failed"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(
    () => [
      { label: "Total in page", value: products.length },
      { label: "Current page", value: currentPage },
      { label: "Total pages", value: totalPages },
    ],
    [products.length, currentPage, totalPages],
  )

  return (
    <section className="product-module">
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="h4 mb-1">Product Management</h2>
              <p className="text-muted mb-0">Full CRUD management for product catalog</p>
            </div>
            <button type="button" className="btn btn-primary rounded-3" onClick={openCreateModal}>
              Add Product
            </button>
          </div>

          <div className="row g-2 mt-2">
            {stats.map((item) => (
              <div className="col-md-4" key={item.label}>
                <div className="border rounded-3 bg-light px-3 py-2">
                  <div className="small text-muted">{item.label}</div>
                  <div className="fw-semibold">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-10">
              <label className="form-label">Search by name</label>
              <input
                type="text"
                className="form-control"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setCurrentPage(1)
                    setSearchKeyword(searchInput.trim())
                  }
                }}
                placeholder="Enter product name..."
              />
            </div>
            <div className="col-md-2 d-grid">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  setCurrentPage(1)
                  setSearchKeyword(searchInput.trim())
                }}
              >
                Search
              </button>
            </div>
            <div className="col-12">
              <label className="form-label mb-2">Danh sách</label>
              <ul className="nav nav-pills gap-2">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${!showHiddenProducts ? "active" : ""}`}
                    onClick={() => {
                      setShowHiddenProducts(false)
                      setCurrentPage(1)
                    }}
                  >
                    Đang hiển thị
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${showHiddenProducts ? "active" : ""}`}
                    onClick={() => {
                      setShowHiddenProducts(true)
                      setCurrentPage(1)
                    }}
                  >
                    Sản phẩm đã ẩn (HIDDEN)
                  </button>
                </li>
              </ul>
              <p className="form-text mb-0">
                {showHiddenProducts
                  ? "Sản phẩm đã ẩn: «Khôi phục» để bán lại trên web, hoặc «Xóa vĩnh viễn» để xóa hẳn."
                  : "Sản phẩm đang bán / tạm ngưng. Dùng nút «Ẩn» để ẩn khỏi shop — bạn vẫn ở tab này để ẩn tiếp."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger rounded-3">{error}</div> : null}
      {success ? <div className="alert alert-success rounded-3">{success}</div> : null}

      <ProductTable
        products={products}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        hiddenView={showHiddenProducts}
        onEdit={openEditModal}
        onHide={handleHide}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onPageChange={setCurrentPage}
      />

      <ProductFormModal
        show={showModal}
        categories={categories}
        initialData={selectedProduct}
        saving={saving}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </section>
  )
}
