import type { VariantPreviewRow } from "@/lib/productVariants"

type VariantPreviewTableProps = {
  rows: VariantPreviewRow[]
}

export function VariantPreviewTable({ rows }: VariantPreviewTableProps) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div>
      <label className="form-label mb-2">Variant Preview</label>
      <div className="table-responsive border rounded-3" style={{ maxHeight: "240px", overflowY: "auto" }}>
        <table className="table table-sm table-striped mb-0 align-middle">
          <thead className="table-light sticky-top">
            <tr>
              <th>Color</th>
              <th>Size</th>
              <th>SKU Preview</th>
              <th className="text-end">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.colorId}-${row.size}`}>
                <td>{row.color}</td>
                <td>{row.size}</td>
                <td>
                  <code className="small">{row.skuPreview}</code>
                </td>
                <td className="text-end">{row.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-text">SKU tự sinh — không chỉnh sửa thủ công.</div>
    </div>
  )
}
