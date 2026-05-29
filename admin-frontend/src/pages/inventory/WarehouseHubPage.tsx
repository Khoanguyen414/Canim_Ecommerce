import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Download,
  PackageMinus,
  PackagePlus,
  Search,
  Settings2,
  Warehouse,
} from "lucide-react"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { warehouseService } from "@/services/warehouse.service"
import { productService } from "@/services/product.service"
import { downloadInventoryExcel } from "@/services/inventory.service"
import { getApiErrorMessage } from "@/lib/apiError"
import type { ProductSummary, Warehouse as WarehouseType } from "@/types/api"

type StockRow = {
  productId: number
  name: string
  sku: string
  stock: number
  status: "in" | "low" | "out"
}

function stockStatus(qty: number): StockRow["status"] {
  if (qty <= 0) return "out"
  if (qty <= 10) return "low"
  return "in"
}

function statusLabel(s: StockRow["status"]) {
  if (s === "in") return "Còn hàng"
  if (s === "low") return "Sắp hết"
  return "Hết hàng"
}

export function WarehouseHubPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [stockRows, setStockRows] = useState<StockRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [whRes, prodRes] = await Promise.all([
        warehouseService.getAll(),
        productService.getProducts({ pageNum: 1, sizePage: 100, includeHidden: true }),
      ])
      if (!whRes.data.success) throw new Error(whRes.data.message ?? "Không tải được kho")
      const whList = (whRes.data.result ?? []).filter((w) => w.isDeleted !== true)
      setWarehouses(whList)

      const products = (prodRes.data.result?.data ?? prodRes.data.result?.content ?? []) as ProductSummary[]
      const rows: StockRow[] = []
      for (const p of products) {
        for (const v of p.variants ?? []) {
          if (!v.sku) continue
          const stock = Number(v.quantity ?? 0)
          rows.push({
            productId: p.id,
            name: p.name,
            sku: v.sku,
            stock,
            status: stockStatus(stock),
          })
        }
      }
      setStockRows(rows)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setWarehouses([])
      setStockRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredWarehouses = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return warehouses
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        String(w.id).includes(q) ||
        (w.address ?? "").toLowerCase().includes(q),
    )
  }, [warehouses, search])

  const filteredStock = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stockRows.slice(0, 20)
    return stockRows
      .filter((r) => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q))
      .slice(0, 30)
  }, [stockRows, search])

  const kpi = useMemo(() => {
    const low = stockRows.filter((r) => r.status === "low").length
    const out = stockRows.filter((r) => r.status === "out").length
    const totalUnits = stockRows.reduce((s, r) => s + r.stock, 0)
    return { low, out, totalUnits }
  }, [stockRows])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      await downloadInventoryExcel()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="wh-page page-stack">
      <header className="wh-page-header">
        <div className="wh-page-header-main">
          <h1 className="wh-title">Kho hàng</h1>
          <nav className="wh-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page">Tồn kho</span>
          </nav>
        </div>
        <div className="wh-page-header-tools">
          <div className="wh-search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Tìm kho, SKU, sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm"
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={exporting}
            onClick={() => void handleExport()}
          >
            <Download size={15} />
            {exporting ? "Đang xuất..." : "Báo cáo Excel"}
          </button>
          <Link to="/warehouses/manage" className="btn btn-secondary btn-sm">
            <Settings2 size={15} />
            Quản lý kho
          </Link>
        </div>
      </header>

      {error ? (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <section className="wh-kpi-grid" aria-label="Chỉ số tồn kho">
        <article className="wh-kpi-card">
          <div className="wh-kpi-icon">
            <Warehouse size={22} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="wh-kpi-body">
            <p className="wh-kpi-label">Kho đang hoạt động</p>
            <p className="wh-kpi-value">{loading ? "—" : warehouses.filter((w) => w.isActive !== false).length}</p>
            <p className="wh-kpi-trend">Từ API /warehouses</p>
          </div>
        </article>
        <article className="wh-kpi-card">
          <div className="wh-kpi-icon">
            <PackagePlus size={22} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="wh-kpi-body">
            <p className="wh-kpi-label">Tổng tồn (SKU)</p>
            <p className="wh-kpi-value">{loading ? "—" : kpi.totalUnits.toLocaleString("vi-VN")}</p>
            <p className="wh-kpi-trend">Theo GET /products → variant.quantity</p>
          </div>
        </article>
        <article className="wh-kpi-card">
          <div className="wh-kpi-icon">
            <AlertTriangle size={22} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="wh-kpi-body">
            <p className="wh-kpi-label">SKU sắp hết (≤10)</p>
            <p className="wh-kpi-value">{loading ? "—" : kpi.low}</p>
            <p className="wh-kpi-trend">Cần nhập thêm</p>
          </div>
        </article>
        <article className="wh-kpi-card">
          <div className="wh-kpi-icon">
            <PackageMinus size={22} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="wh-kpi-body">
            <p className="wh-kpi-label">SKU hết hàng</p>
            <p className="wh-kpi-value">{loading ? "—" : kpi.out}</p>
            <p className="wh-kpi-trend">Tồn khả dụng = 0</p>
          </div>
        </article>
      </section>

      <section className="wh-card wh-quick-card card-padded">
        <h3>Thao tác nhanh</h3>
        <div className="wh-quick-actions">
          <Link to="/warehouses/import" className="btn btn-primary wh-quick-primary">
            <PackagePlus size={18} />
            Nhập kho
          </Link>
          <Link to="/warehouses/export" className="btn btn-outline-gold">
            <PackageMinus size={18} />
            Xuất kho
          </Link>
          <Link to="/warehouses/stock-check" className="btn btn-outline-gold">
            <ClipboardList size={18} />
            Kiểm kê
          </Link>
          <Link to="/suppliers" className="btn btn-outline-gold">
            Nhà cung cấp
          </Link>
        </div>
      </section>

      <div className="wh-layout wh-layout-single">
        <section className="wh-card wh-table-card">
          <div className="wh-card-head">
            <h2>Danh sách kho</h2>
          </div>
          <div className="wh-table-wrap">
            <table className="wh-table data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên kho</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="wh-table-empty">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="wh-table-empty">
                      Chưa có kho — <Link to="/warehouses/manage">tạo kho</Link>
                    </td>
                  </tr>
                ) : (
                  filteredWarehouses.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <code className="wh-code">WH-{String(w.id).padStart(3, "0")}</code>
                      </td>
                      <td className="wh-cell-name">{w.name}</td>
                      <td>{w.address || "—"}</td>
                      <td>
                        <Badge variant={w.isActive !== false ? "success" : "neutral"}>
                          {w.isActive !== false ? "Hoạt động" : "Ngưng"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="wh-card wh-table-card">
          <div className="wh-card-head">
            <h2>Tồn theo biến thể (SKU)</h2>
            <p className="text-muted" style={{ fontSize: "0.875rem", margin: 0 }}>
              Kho mặc định ID 1 — backend chưa có API list tồn riêng; dùng báo cáo Excel để chi tiết lô.
            </p>
          </div>
          <div className="wh-table-wrap">
            <table className="wh-table data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Sản phẩm</th>
                  <th>Tồn khả dụng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="wh-table-empty">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="wh-table-empty">
                      Không có dữ liệu SKU
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((row) => (
                    <tr key={`${row.productId}-${row.sku}`}>
                      <td className="td-muted">{row.sku}</td>
                      <td>{row.name}</td>
                      <td>
                        <strong>{row.stock}</strong>
                      </td>
                      <td>
                        <span className={`stock-badge stock-${row.status}`}>{statusLabel(row.status)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
