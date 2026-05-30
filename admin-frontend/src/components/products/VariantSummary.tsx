import type { VariantSummary as VariantSummaryData } from "@/lib/productVariants"

type VariantSummaryProps = {
  summary: VariantSummaryData
}

export function VariantSummary({ summary }: VariantSummaryProps) {
  return (
    <div className="border rounded-3 bg-light p-3">
      <div className="fw-semibold mb-2">Summary</div>
      <div className="row g-2 small">
        <div className="col-6 col-md-3">
          <span className="text-muted">Colors:</span> <strong>{summary.colorCount}</strong>
        </div>
        <div className="col-6 col-md-3">
          <span className="text-muted">Sizes:</span> <strong>{summary.sizeCount}</strong>
        </div>
        <div className="col-6 col-md-3">
          <span className="text-muted">Variants:</span> <strong>{summary.variantCount}</strong>
        </div>
        <div className="col-6 col-md-3">
          <span className="text-muted">Total Stock:</span> <strong>{summary.totalStock}</strong>
        </div>
      </div>
    </div>
  )
}
