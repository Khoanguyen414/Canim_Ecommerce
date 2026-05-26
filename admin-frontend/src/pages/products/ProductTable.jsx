function formatDate(value) {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return date.toLocaleString("vi-VN")
}

const statusBadgeClass = {
  ACTIVE: "bg-success",
  INACTIVE: "bg-secondary",
  HIDDEN: "bg-danger",
}

export function ProductTable({
  products,
  loading,
  currentPage,
  totalPages,
  hiddenView = false,
  onEdit,
  onHide,
  onRestore,
  onPermanentDelete,
  onPageChange,
}) {
  return (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 72 }}>Ảnh</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Status</th>
              <th>CreatedAt</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
                  Loading products...
                </td>
              </tr>
            ) : null}

            {!loading && products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
                  {hiddenView ? "Không có sản phẩm đã ẩn" : "Không có sản phẩm"}
                </td>
              </tr>
            ) : null}

            {!loading
              ? products.map((product) => {
                  const thumb =
                    product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url
                  return (
                    <tr key={product.id}>
                      <td>
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                          />
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{product.name}</div>
                        <small className="text-muted">{product.slug}</small>
                      </td>
                      <td>{product.brand || "--"}</td>
                      <td>{product.category?.name || "--"}</td>
                      <td>
                        <span className={`badge rounded-pill ${statusBadgeClass[product.status] || "bg-secondary"}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>{formatDate(product.createdAt)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(product.id)}>
                            Sửa
                          </button>
                          {hiddenView || product.status === "HIDDEN" ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => onRestore(product.id)}
                              >
                                Khôi phục
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => onPermanentDelete(product.id)}
                              >
                                Xóa vĩnh viễn
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => onHide(product.id)}
                            >
                              Ẩn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-muted small">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}
