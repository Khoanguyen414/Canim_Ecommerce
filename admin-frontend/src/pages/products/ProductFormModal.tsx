import { useEffect, useMemo, useState } from "react"
import { ColorManager } from "@/components/products/ColorManager"
import { InitialInboundSection } from "@/components/products/InitialInboundSection"
import { SizeSelector } from "@/components/products/SizeSelector"
import { VariantMatrixTable } from "@/components/products/VariantMatrixTable"
import { VariantPreviewTable } from "@/components/products/VariantPreviewTable"
import { VariantSummary } from "@/components/products/VariantSummary"
import { STANDARD_SIZES } from "@/config/productSizes"
import { supplierService } from "@/services/supplier.service"
import { warehouseService } from "@/services/warehouse.service"
import type { Supplier, Warehouse } from "@/types/api"
import type { ProductColor, StockMatrix } from "@/lib/productVariants"
import {
  buildVariantPreviews,
  computeVariantSummary,
  ensureStockMatrix,
  validateCreateProductForm,
} from "@/lib/productVariants"

function slugify(value: string) {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

type ProductImage = {
  id?: string | number
  url: string
  isMain?: boolean
  position?: number
}

type ProductFormValues = {
  id: number | null
  name: string
  slug: string
  brand: string
  shortDesc: string
  longDesc: string
  status: string
  categoryId: string
  variantPrice: string
  colors: ProductColor[]
  selectedSizes: string[]
  stockMatrix: StockMatrix
  warehouseId: number | ""
  supplierId: number | ""
  inboundNote: string
  images: ProductImage[]
}

const EMPTY_FORM: ProductFormValues = {
  id: null,
  name: "",
  slug: "",
  brand: "",
  shortDesc: "",
  longDesc: "",
  status: "ACTIVE",
  categoryId: "",
  variantPrice: "",
  colors: [],
  selectedSizes: [...STANDARD_SIZES],
  stockMatrix: {},
  warehouseId: "",
  supplierId: "",
  inboundNote: "",
  images: [],
}

type ProductFormSubmitPayload = Omit<ProductFormValues, "categoryId"> & {
  categoryId: number
  uploadFiles: File[]
}

type ProductFormModalProps = {
  show: boolean
  categories: { id: number; name: string }[]
  initialData: Record<string, unknown> | null
  saving: boolean
  onSubmit: (payload: ProductFormSubmitPayload) => void
  onClose: () => void
}

export function ProductFormModal({ show, categories, initialData, saving, onSubmit, onClose }: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormValues>(EMPTY_FORM)
  const [imageUrlRows, setImageUrlRows] = useState([{ key: `row-${Date.now()}`, url: "" }])
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState<ProductFormValues>(EMPTY_FORM)
  const [manualSlug, setManualSlug] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inboundMasterLoading, setInboundMasterLoading] = useState(false)

  const isCreate = !formData.id

  useEffect(() => {
    if (!show) return
    const mapped: ProductFormValues = initialData
      ? {
          id: (initialData.id as number) ?? null,
          name: (initialData.name as string) || "",
          slug: (initialData.slug as string) || "",
          brand: (initialData.brand as string) || "",
          shortDesc: (initialData.shortDesc as string) || "",
          longDesc: (initialData.longDesc as string) || "",
          status: (initialData.status as string) || "ACTIVE",
          categoryId: String((initialData.category as { id?: number })?.id || ""),
          variantPrice: "",
          colors: [],
          selectedSizes: [],
          stockMatrix: {},
          warehouseId: "",
          supplierId: "",
          inboundNote: "",
          images: Array.isArray(initialData.images) ? (initialData.images as ProductImage[]) : [],
        }
      : EMPTY_FORM
    setFormData(mapped)
    setInitialSnapshot(mapped)
    setUploadFiles([])
    setImageUrlRows([{ key: `row-${Date.now()}`, url: "" }])
    setManualSlug(Boolean(mapped.id))
    setValidationErrors({})
  }, [show, initialData?.id])

  useEffect(() => {
    if (!show || initialData?.id) return

    let cancelled = false
    const loadInboundMaster = async () => {
      setInboundMasterLoading(true)
      try {
        const [whRes, supRes] = await Promise.all([warehouseService.getAll(), supplierService.getAll()])
        if (cancelled) return

        const whList = (whRes.data.result ?? []).filter((w) => w.isDeleted !== true)
        const supList = (supRes.data.result ?? []).filter((s) => s.isActive !== false)
        setWarehouses(whList)
        setSuppliers(supList)

        setFormData((prev) => ({
          ...prev,
          warehouseId: prev.warehouseId !== "" ? prev.warehouseId : (whList[0]?.id ?? ""),
          supplierId: prev.supplierId !== "" ? prev.supplierId : (supList[0]?.id ?? ""),
        }))
      } catch {
        if (!cancelled) {
          setWarehouses([])
          setSuppliers([])
        }
      } finally {
        if (!cancelled) setInboundMasterLoading(false)
      }
    }

    void loadInboundMaster()
    return () => {
      cancelled = true
    }
  }, [show, initialData?.id])

  const previewImages = useMemo(
    () =>
      (formData.images || []).map((image, index) => ({
        id: image.id ?? `new-${index}`,
        url: image.url,
        isMain: Boolean(image.isMain),
        position: image.position ?? index,
      })),
    [formData.images],
  )

  const previewFileImages = useMemo(
    () =>
      uploadFiles.map((file) => ({
        id: `file-${file.name}-${file.lastModified}`,
        url: URL.createObjectURL(file),
      })),
    [uploadFiles],
  )

  useEffect(
    () => () => {
      previewFileImages.forEach((item) => URL.revokeObjectURL(item.url))
    },
    [previewFileImages],
  )

  const variantPreviews = useMemo(
    () =>
      isCreate
        ? buildVariantPreviews(formData.name, formData.colors, formData.selectedSizes, formData.stockMatrix)
        : [],
    [isCreate, formData.name, formData.colors, formData.selectedSizes, formData.stockMatrix],
  )

  const variantSummary = useMemo(
    () => computeVariantSummary(formData.colors, formData.selectedSizes, formData.stockMatrix),
    [formData.colors, formData.selectedSizes, formData.stockMatrix],
  )

  const setField = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
    setFormData((prev) => {
      if (field === "name" && !manualSlug) {
        return { ...prev, name: value as string, slug: slugify(value as string) }
      }
      return { ...prev, [field]: value }
    })
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    }
  }

  const setColors = (colors: ProductColor[]) => {
    setFormData((prev) => ({
      ...prev,
      colors,
      stockMatrix: ensureStockMatrix(colors, prev.selectedSizes, prev.stockMatrix),
    }))
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next.colors
      delete next.stockMatrix
      return next
    })
  }

  const setSelectedSizes = (selectedSizes: string[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedSizes,
      stockMatrix: ensureStockMatrix(prev.colors, selectedSizes, prev.stockMatrix),
    }))
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next.sizes
      delete next.stockMatrix
      return next
    })
  }

  const setStock = (colorId: string, size: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      stockMatrix: {
        ...prev.stockMatrix,
        [colorId]: {
          ...prev.stockMatrix[colorId],
          [size]: quantity,
        },
      },
    }))
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next.stockMatrix
      return next
    })
  }

  const addImageUrl = (rowKey: string) => {
    const row = imageUrlRows.find((item) => item.key === rowKey)
    const trimmed = row?.url?.trim()
    if (!trimmed) return
    setFormData((prev) => {
      const next = [
        ...(prev.images || []),
        {
          id: `tmp-${Date.now()}`,
          url: trimmed,
          isMain: (prev.images || []).length === 0,
          position: (prev.images || []).length,
        },
      ]
      return { ...prev, images: next }
    })
    setImageUrlRows((rows) => rows.map((item) => (item.key === rowKey ? { ...item, url: "" } : item)))
  }

  const addImageUrlRow = () => {
    setImageUrlRows((rows) => [...rows, { key: `row-${Date.now()}-${rows.length}`, url: "" }])
  }

  const removeImageUrlRow = (rowKey: string) => {
    setImageUrlRows((rows) => {
      if (rows.length <= 1) return rows
      return rows.filter((item) => item.key !== rowKey)
    })
  }

  const updateImageUrlRow = (rowKey: string, value: string) => {
    setImageUrlRows((rows) => rows.map((item) => (item.key === rowKey ? { ...item, url: value } : item)))
  }

  const removeImage = (id: string | number) => {
    setFormData((prev) => {
      const next = (prev.images || []).filter((image) => image.id !== id)
      if (next.length > 0 && !next.some((image) => image.isMain)) {
        next[0] = { ...next[0], isMain: true }
      }
      return { ...prev, images: next }
    })
  }

  const setMainImage = (id: string | number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).map((image) => ({
        ...image,
        isMain: image.id === id,
      })),
    }))
  }

  const resetForm = () => {
    setFormData(initialSnapshot)
    setUploadFiles([])
    setImageUrlRows([{ key: `row-${Date.now()}`, url: "" }])
    setManualSlug(Boolean(initialSnapshot.id))
    setValidationErrors({})
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (isCreate) {
      const errors = validateCreateProductForm({
        name: formData.name,
        categoryId: formData.categoryId,
        variantPrice: formData.variantPrice,
        colors: formData.colors,
        selectedSizes: formData.selectedSizes,
        stockMatrix: formData.stockMatrix,
        warehouseId: formData.warehouseId,
        supplierId: formData.supplierId,
      })
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
    }

    const pendingUrls = imageUrlRows.map((row) => row.url?.trim()).filter(Boolean) as string[]
    const mergedImages = [...(formData.images || [])]
    pendingUrls.forEach((url, index) => {
      if (!mergedImages.some((img) => img.url === url)) {
        mergedImages.push({
          id: `tmp-pending-${Date.now()}-${index}`,
          url,
          isMain: mergedImages.length === 0,
          position: mergedImages.length,
        })
      }
    })

    onSubmit({
      ...formData,
      categoryId: Number(formData.categoryId),
      images: mergedImages,
      uploadFiles: uploadFiles.filter((f) => f.size > 0),
    })
  }

  if (!show) return null

  return (
    <div
      className="modal d-block show"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", overflowY: "auto" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-xl" style={{ margin: "1rem auto", maxWidth: "1200px" }}>
        <div
          className="modal-content border-0 rounded-4 shadow"
          style={{ maxHeight: "calc(100vh - 2rem)", display: "flex", flexDirection: "column" }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
            <div className="modal-header">
              <h5 className="modal-title">{formData.id ? "Update Product" : "Create Product"}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={(event) => setField("name", event.target.value)}
                    required
                  />
                  {validationErrors.name ? <div className="invalid-feedback d-block">{validationErrors.name}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(event) => {
                      setManualSlug(true)
                      setField("slug", event.target.value)
                    }}
                    required
                    disabled={Boolean(formData.id)}
                  />
                  <div className="form-text">
                    {formData.id ? "Slug is generated by backend and cannot be updated." : "Slug auto-generates from name."}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.brand}
                    onChange={(event) => setField("brand", event.target.value)}
                    placeholder="Brand is currently read-only in backend"
                  />
                  <div className="form-text">Backend hiện chưa cập nhật trực tiếp brand qua API product update.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={(event) => setField("status", event.target.value)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    className={`form-select ${validationErrors.categoryId ? "is-invalid" : ""}`}
                    value={formData.categoryId}
                    onChange={(event) => setField("categoryId", event.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.categoryId ? (
                    <div className="invalid-feedback d-block">{validationErrors.categoryId}</div>
                  ) : null}
                </div>

                {isCreate ? (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Variant Price (all variants)</label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.variantPrice ? "is-invalid" : ""}`}
                        value={formData.variantPrice}
                        onChange={(event) => setField("variantPrice", event.target.value)}
                        min="0"
                        step="1000"
                        placeholder="VD: 199000"
                        required
                      />
                      <div className="form-text">Giá áp dụng cho mọi biến thể màu × size.</div>
                      {validationErrors.variantPrice ? (
                        <div className="invalid-feedback d-block">{validationErrors.variantPrice}</div>
                      ) : null}
                    </div>

                    <div className="col-12">
                      <hr className="my-1" />
                      <h6 className="text-muted mb-0">Biến thể (Color × Size)</h6>
                    </div>

                    <div className="col-md-6">
                      <ColorManager colors={formData.colors} onChange={setColors} error={validationErrors.colors} />
                    </div>

                    <div className="col-md-6">
                      <SizeSelector
                        selectedSizes={formData.selectedSizes}
                        onChange={setSelectedSizes}
                        error={validationErrors.sizes}
                      />
                    </div>

                    <div className="col-12">
                      <VariantMatrixTable
                        colors={formData.colors}
                        selectedSizes={formData.selectedSizes}
                        stockMatrix={formData.stockMatrix}
                        onStockChange={setStock}
                        error={validationErrors.stockMatrix}
                      />
                    </div>

                    <div className="col-12 col-lg-7">
                      <VariantPreviewTable rows={variantPreviews} />
                    </div>

                    <div className="col-12 col-lg-5">
                      <VariantSummary summary={variantSummary} />
                    </div>

                    <InitialInboundSection
                      warehouses={warehouses}
                      suppliers={suppliers}
                      warehouseId={formData.warehouseId}
                      supplierId={formData.supplierId}
                      inboundNote={formData.inboundNote}
                      totalStock={variantSummary.totalStock}
                      loading={inboundMasterLoading}
                      errors={{
                        warehouseId: validationErrors.warehouseId,
                        supplierId: validationErrors.supplierId,
                      }}
                      onWarehouseChange={(id) => {
                        setField("warehouseId", id)
                        setValidationErrors((prev) => {
                          const next = { ...prev }
                          delete next.warehouseId
                          return next
                        })
                      }}
                      onSupplierChange={(id) => {
                        setField("supplierId", id)
                        setValidationErrors((prev) => {
                          const next = { ...prev }
                          delete next.supplierId
                          return next
                        })
                      }}
                      onNoteChange={(note) => setField("inboundNote", note)}
                    />
                  </>
                ) : null}

                <div className="col-12">
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.shortDesc}
                    onChange={(event) => setField("shortDesc", event.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Long Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.longDesc}
                    onChange={(event) => setField("longDesc", event.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Ảnh từ URL (tùy chọn)</label>
                  <p className="form-text mb-2">
                    Dán link ảnh trực tiếp (.jpg, .png…), bấm <strong>Thêm</strong> hoặc Lưu sản phẩm. Tránh Google
                    Drive (dễ lỗi CORS).
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {imageUrlRows.map((row) => (
                      <div className="input-group" key={row.key}>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://example.com/image.jpg"
                          value={row.url}
                          onChange={(event) => updateImageUrlRow(row.key, event.target.value)}
                        />
                        <button type="button" className="btn btn-outline-primary" onClick={() => addImageUrl(row.key)}>
                          Thêm
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeImageUrlRow(row.key)}>
                          Remove Row
                        </button>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addImageUrlRow}>
                        + Add URL Row
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Tải ảnh từ máy (khuyến nghị)</label>
                  <p className="form-text mb-2">
                    Chọn JPG/PNG/WebP. Ảnh upload lên Cloudinary sau khi lưu sản phẩm thành công.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="form-control"
                    onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
                  />
                  {uploadFiles.length > 0 ? (
                    <div className="form-text text-success">Đã chọn {uploadFiles.length} file — sẽ upload khi lưu.</div>
                  ) : null}
                </div>

                <div className="col-12">
                  <div className="row g-3">
                    {previewImages.length === 0 ? (
                      <div className="col-12 text-muted small">No image preview</div>
                    ) : (
                      previewImages.map((image) => (
                        <div key={image.id} className="col-sm-6 col-md-4 col-xl-3">
                          <div className="card h-100 border rounded-4 overflow-hidden">
                            <img src={image.url} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover" }} />
                            <div className="card-body p-2 d-flex justify-content-between align-items-center">
                              <div className="form-check mb-0">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="mainImage"
                                  checked={Boolean(image.isMain)}
                                  onChange={() => setMainImage(image.id)}
                                />
                                <label className="form-check-label small">Main</label>
                              </div>
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImage(image.id)}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {previewFileImages.length > 0 ? (
                  <div className="col-12">
                    <label className="form-label">Selected file previews</label>
                    <div className="row g-3">
                      {previewFileImages.map((image) => (
                        <div key={image.id} className="col-sm-6 col-md-4 col-xl-3">
                          <div className="card h-100 border rounded-4 overflow-hidden">
                            <img src={image.url} alt="new upload" style={{ width: "100%", height: 140, objectFit: "cover" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid #e5e7eb", background: "#fff" }}>
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={saving}>
                Reset Form
              </button>
              <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : formData.id ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
