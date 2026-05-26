import { useEffect, useMemo, useState } from "react"

function slugify(value) {
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

const EMPTY_FORM = {
  id: null,
  name: "",
  slug: "",
  brand: "",
  shortDesc: "",
  longDesc: "",
  status: "ACTIVE",
  categoryId: "",
  variantSku: "",
  variantPrice: "",
  variantColor: "",
  variantSize: "",
  images: [],
}

export function ProductFormModal({ show, categories, initialData, saving, onSubmit, onClose }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [imageUrlRows, setImageUrlRows] = useState([{ key: `row-${Date.now()}`, url: "" }])
  const [uploadFiles, setUploadFiles] = useState([])
  const [initialSnapshot, setInitialSnapshot] = useState(EMPTY_FORM)
  const [manualSlug, setManualSlug] = useState(false)

  useEffect(() => {
    if (!show) return
    const mapped = initialData
      ? {
          id: initialData.id,
          name: initialData.name || "",
          slug: initialData.slug || "",
          brand: initialData.brand || "",
          shortDesc: initialData.shortDesc || "",
          longDesc: initialData.longDesc || "",
          status: initialData.status || "ACTIVE",
          categoryId: String(initialData.category?.id || ""),
          variantSku: initialData.variants?.[0]?.sku || "",
          variantPrice: initialData.variants?.[0]?.price != null ? String(initialData.variants[0].price) : "",
          variantColor: initialData.variants?.[0]?.color || "",
          variantSize: initialData.variants?.[0]?.size || "",
          images: Array.isArray(initialData.images) ? initialData.images : [],
        }
      : EMPTY_FORM
    setFormData(mapped)
    setInitialSnapshot(mapped)
    setUploadFiles([])
    setImageUrlRows([{ key: `row-${Date.now()}`, url: "" }])
    setManualSlug(Boolean(mapped.id))
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

  const setField = (field, value) => {
    setFormData((prev) => {
      if (field === "name" && !manualSlug) {
        return { ...prev, name: value, slug: slugify(value) }
      }
      return { ...prev, [field]: value }
    })
  }

  const addImageUrl = (rowKey) => {
    const row = imageUrlRows.find((item) => item.key === rowKey)
    const trimmed = row?.url?.trim()
    if (!trimmed) return
    setFormData((prev) => {
      const next = [
        ...(prev.images || []),
        { id: `tmp-${Date.now()}`, url: trimmed, isMain: (prev.images || []).length === 0, position: (prev.images || []).length },
      ]
      return { ...prev, images: next }
    })
    setImageUrlRows((rows) => rows.map((item) => (item.key === rowKey ? { ...item, url: "" } : item)))
  }

  const addImageUrlRow = () => {
    setImageUrlRows((rows) => [...rows, { key: `row-${Date.now()}-${rows.length}`, url: "" }])
  }

  const removeImageUrlRow = (rowKey) => {
    setImageUrlRows((rows) => {
      if (rows.length <= 1) return rows
      return rows.filter((item) => item.key !== rowKey)
    })
  }

  const updateImageUrlRow = (rowKey, value) => {
    setImageUrlRows((rows) => rows.map((item) => (item.key === rowKey ? { ...item, url: value } : item)))
  }

  const removeImage = (id) => {
    setFormData((prev) => {
      const next = (prev.images || []).filter((image) => image.id !== id)
      if (next.length > 0 && !next.some((image) => image.isMain)) {
        next[0] = { ...next[0], isMain: true }
      }
      return { ...prev, images: next }
    })
  }

  const setMainImage = (id) => {
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
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Gộp URL đang gõ nhưng chưa bấm "Thêm" — tránh mất ảnh khi submit
    const pendingUrls = imageUrlRows.map((row) => row.url?.trim()).filter(Boolean)
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
                    className="form-control"
                    value={formData.name}
                    onChange={(event) => setField("name", event.target.value)}
                    required
                  />
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
                    className="form-select"
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
                </div>

                {!formData.id ? (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Variant SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.variantSku}
                        onChange={(event) => setField("variantSku", event.target.value)}
                        placeholder="VD: AOPOLO-TRANG-M"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Variant Price</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.variantPrice}
                        onChange={(event) => setField("variantPrice", event.target.value)}
                        min="0"
                        step="1000"
                        placeholder="VD: 199000"
                        required
                      />
                      <div className="form-text">Bắt buộc để backend tạo product variant hợp lệ.</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Variant Color (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.variantColor}
                        onChange={(event) => setField("variantColor", event.target.value)}
                        placeholder="VD: Trắng"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Variant Size (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.variantSize}
                        onChange={(event) => setField("variantSize", event.target.value)}
                        placeholder="VD: M"
                      />
                    </div>
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
                    <div className="form-text text-success">
                      Đã chọn {uploadFiles.length} file — sẽ upload khi lưu.
                    </div>
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
