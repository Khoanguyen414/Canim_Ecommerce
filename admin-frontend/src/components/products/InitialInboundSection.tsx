import { Link } from "react-router-dom"
import { WarehouseField } from "@/components/inventory/WarehouseField"
import type { Supplier, Warehouse } from "@/types/api"

type InitialInboundSectionProps = {
  warehouses: Warehouse[]
  suppliers: Supplier[]
  warehouseId: number | ""
  supplierId: number | ""
  inboundNote: string
  totalStock: number
  loading: boolean
  errors?: {
    warehouseId?: string
    supplierId?: string
  }
  onWarehouseChange: (id: number | "") => void
  onSupplierChange: (id: number | "") => void
  onNoteChange: (note: string) => void
}

export function InitialInboundSection({
  warehouses,
  suppliers,
  warehouseId,
  supplierId,
  inboundNote,
  totalStock,
  loading,
  errors,
  onWarehouseChange,
  onSupplierChange,
  onNoteChange,
}: InitialInboundSectionProps) {
  if (totalStock <= 0) {
    return (
      <div className="col-12">
        <div className="border rounded-3 bg-light p-3 small text-muted">
          Ma trận đang toàn 0 — sản phẩm tạo xong sẽ không có tồn kho. Bạn có thể nhập thêm sau tại{" "}
          <Link to="/warehouses/import">Phiếu nhập kho</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="col-12">
      <div className="border rounded-3 p-3">
        <h6 className="mb-1">Nhập kho ban đầu</h6>
        <p className="form-text mb-3">
          Tổng <strong>{totalStock}</strong> sản phẩm trong ma trận sẽ được tạo phiếu nhập kho tự động sau khi lưu.
          Muốn bổ sung thêm sau này → dùng <Link to="/warehouses/import">Phiếu nhập kho</Link> như bình thường.
        </p>

        {loading ? (
          <p className="text-muted small mb-0">Đang tải kho &amp; nhà cung cấp…</p>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <WarehouseField
                warehouses={warehouses}
                value={warehouseId}
                onChange={onWarehouseChange}
              />
              {errors?.warehouseId ? (
                <div className="form-text text-danger">{errors.warehouseId}</div>
              ) : warehouses.length === 0 ? (
                <div className="form-text">
                  <Link to="/warehouses/manage">Tạo kho</Link> trước khi nhập tồn.
                </div>
              ) : null}
            </div>

            <div className="col-md-6">
              <div className="form-field">
                <label htmlFor="product-supplier-select" className="form-label">
                  Nhà cung cấp
                </label>
                <select
                  id="product-supplier-select"
                  className={`form-select ${errors?.supplierId ? "is-invalid" : ""}`}
                  value={supplierId === "" ? "" : String(supplierId)}
                  disabled={suppliers.length === 0}
                  onChange={(e) => onSupplierChange(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">— Chọn NCC —</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                      {supplier.supplierCode ? ` (${supplier.supplierCode})` : ""}
                    </option>
                  ))}
                </select>
                {errors?.supplierId ? (
                  <div className="invalid-feedback d-block">{errors.supplierId}</div>
                ) : suppliers.length === 0 ? (
                  <div className="form-text">
                    Chưa có NCC — thêm tại <Link to="/warehouses/manage">Quản lý kho</Link>.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Ghi chú phiếu nhập (tùy chọn)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="VD: Lô hàng mới tạo từ form sản phẩm"
                value={inboundNote}
                onChange={(e) => onNoteChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
