import type { ProductColor, StockMatrix } from "@/lib/productVariants"
import { orderSizes } from "@/lib/productVariants"

type VariantMatrixTableProps = {
  colors: ProductColor[]
  selectedSizes: string[]
  stockMatrix: StockMatrix
  onStockChange: (colorId: string, size: string, quantity: number) => void
  error?: string
}

export function VariantMatrixTable({
  colors,
  selectedSizes,
  stockMatrix,
  onStockChange,
  error,
}: VariantMatrixTableProps) {
  const sizes = orderSizes(selectedSizes)

  if (colors.length === 0 || sizes.length === 0) {
    return (
      <div className="text-muted small">
        Chọn ít nhất một màu và một size để hiển thị ma trận tồn kho.
      </div>
    )
  }

  return (
    <div>
      <label className="form-label mb-2">Variant Matrix — Tồn kho theo màu × size</label>
      <div className="table-responsive border rounded-3">
        <table className="table table-sm table-bordered mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: "120px" }}>Color</th>
              {sizes.map((size) => (
                <th key={size} className="text-center" style={{ width: "72px" }}>
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color.id}>
                <td className="fw-medium">{color.name}</td>
                {sizes.map((size) => (
                  <td key={size} className="p-1">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      min={0}
                      step={1}
                      value={stockMatrix[color.id]?.[size] ?? 0}
                      onChange={(e) => {
                        const raw = e.target.value
                        const parsed = raw === "" ? 0 : Number.parseInt(raw, 10)
                        onStockChange(color.id, size, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0)
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-text">
        Số lượng nhập ở đây sẽ tạo phiếu nhập kho tự động khi lưu sản phẩm (nếu &gt; 0). Bổ sung thêm sau tại Phiếu
        nhập kho.
      </div>
      {error ? <div className="form-text text-danger">{error}</div> : null}
    </div>
  )
}
