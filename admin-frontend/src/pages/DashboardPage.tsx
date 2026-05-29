import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Download,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { StockDonutChart } from "@/components/dashboard/StockDonutChart"
import { api } from "@/lib/http"
import { getApiErrorMessage } from "@/lib/apiError"
import { downloadInventoryExcel } from "@/services/inventory.service"
import type { ApiResponse, PagedResult } from "@/types/api"

type ProductRow = {
  id: number
  name: string
  images?: { url: string; isMain?: boolean }[]
  variants?: { sku?: string; quantity?: number; price?: number }[]
  status?: string
}

type InventoryRow = {
  id: string
  name: string
  image?: string
  sku: string
  warehouse: string
  stock: number
  restock: string
  status: "in" | "low" | "out"
}

const BEST_SELLERS = [
  { name: "Áo Polo Nam Essential", sold: 248, revenue: 59_520_000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop" },
  { name: "Quần Jean Slim Fit", sold: 186, revenue: 55_800_000, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop" },
  { name: "Áo Thun Basic Cotton", sold: 312, revenue: 46_800_000, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=80&h=80&fit=crop" },
  { name: "Váy Midi Linen", sold: 94, revenue: 42_300_000, image: "https://images.unsplash.com/photo-1595777455318-0b025c26b3c1?w=80&h=80&fit=crop" },
  { name: "Áo Khoác Bomber", sold: 67, revenue: 40_200_000, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=80&h=80&fit=crop" },
]

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ"
}

function stockStatus(qty: number): InventoryRow["status"] {
  if (qty <= 0) return "out"
  if (qty < 15) return "low"
  return "in"
}

function statusLabel(s: InventoryRow["status"]) {
  if (s === "in") return "Còn hàng"
  if (s === "low") return "Sắp hết"
  return "Hết hàng"
}

export function DashboardPage() {
  const [productCount, setProductCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [products, users] = await Promise.all([
          api.get<ApiResponse<PagedResult<ProductRow>>>("/products?pageNum=1&sizePage=50&includeHidden=true"),
          api.get<ApiResponse<unknown[]>>("/users"),
        ])
        const list = products.data.result?.data ?? products.data.result?.content ?? []
        setProductCount(Number(products.data.result?.totalElements ?? list.length))
        setUserCount(users.data.result?.length ?? 0)

        setInventoryRows(
          list.slice(0, 8).flatMap((p) => {
            const variants = p.variants?.length ? p.variants : [{ sku: `SKU-${p.id}`, quantity: 0 }]
            return variants.slice(0, 2).map((variant) => {
              const qty = Number(variant?.quantity ?? 0)
              const img = p.images?.find((x) => x.isMain)?.url ?? p.images?.[0]?.url
              return {
                id: `SP-${String(p.id).padStart(4, "0")}`,
                name: p.name,
                image: img,
                sku: variant?.sku ?? `SKU-${p.id}`,
                warehouse: "Kho mặc định (#1)",
                stock: qty,
                restock: "—",
                status: stockStatus(qty),
              }
            })
          }),
        )
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const kpis = useMemo(
    () => [
      {
        label: "Tổng doanh thu",
        value: formatVnd(128_500_000),
        trend: "+18.6%",
        up: true,
        icon: Banknote,
        tone: "gold",
      },
      {
        label: "Đơn hàng",
        value: "1.248",
        trend: "+12.4%",
        up: true,
        icon: ShoppingCart,
        tone: "blue",
      },
      {
        label: "Khách hàng",
        value: String(userCount || 856),
        trend: "+9.7%",
        up: true,
        icon: Users,
        tone: "green",
      },
      {
        label: "Sản phẩm",
        value: String(productCount || 342),
        trend: "+6.3%",
        up: true,
        icon: Package,
        tone: "purple",
        to: "/products",
      },
    ],
    [productCount, userCount],
  )

  const stockSummary = useMemo(() => {
    const inStock = inventoryRows.filter((r) => r.status === "in").length
    const lowStock = inventoryRows.filter((r) => r.status === "low").length
    const outOfStock = inventoryRows.filter((r) => r.status === "out").length
    const totalUnits = inventoryRows.reduce((s, r) => s + r.stock, 0)
    return { inStock, lowStock, outOfStock, totalUnits }
  }, [inventoryRows])

  const lowStockAlerts = useMemo(
    () => inventoryRows.filter((r) => r.status === "low" || r.status === "out").slice(0, 5),
    [inventoryRows],
  )

  const handleExportStock = async () => {
    setExporting(true)
    try {
      await downloadInventoryExcel()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="dashboard">
      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

      <section className="kpi-grid">
        {kpis.map((k) => {
          const Icon = k.icon
          const inner = (
            <article className={`kpi-card kpi-${k.tone}`}>
              <div className="kpi-card-top">
                <span className={`kpi-icon kpi-icon-${k.tone}`}>
                  <Icon size={22} />
                </span>
                <span className={`kpi-trend${k.up ? " up" : " down"}`}>
                  {k.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {k.trend}
                </span>
              </div>
              <p className="kpi-label">{k.label}</p>
              <strong className="kpi-value">{loading ? "—" : k.value}</strong>
            </article>
          )
          return "to" in k && k.to ? (
            <Link key={k.label} to={k.to} className="kpi-link">
              {inner}
            </Link>
          ) : (
            <div key={k.label}>{inner}</div>
          )
        })}
      </section>

      <section className="dashboard-row-2">
        <div className="dash-card dash-card-lg">
          <div className="dash-card-head">
            <div>
              <h2>Doanh thu tháng này</h2>
              <p>Biểu đồ doanh thu theo ngày (dữ liệu mẫu)</p>
            </div>
            <select className="dash-select" defaultValue="5" aria-label="Chọn tháng">
              <option value="5">Tháng 5, 2024</option>
              <option value="4">Tháng 4, 2024</option>
            </select>
          </div>
          <RevenueChart />
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Sản phẩm bán chạy</h2>
            <Link to="/products" className="dash-link">
              Xem tất cả
            </Link>
          </div>
          <ul className="best-sellers">
            {BEST_SELLERS.map((item, i) => (
              <li key={item.name}>
                <span className="best-rank">{i + 1}</span>
                <img src={item.image} alt="" />
                <div className="best-info">
                  <strong>{item.name}</strong>
                  <span>
                    {item.sold} đã bán · {formatVnd(item.revenue)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dashboard-row-3">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Tổng quan kho hàng</h2>
            <Link to="/warehouses" className="dash-link">
              Chi tiết
            </Link>
          </div>
          <div className="stock-mini-stats">
            <div>
              <span>Tổng đơn vị tồn</span>
              <strong>{loading ? "—" : stockSummary.totalUnits.toLocaleString("vi-VN")}</strong>
            </div>
            <div>
              <span>Sắp hết</span>
              <strong className="text-warning">{loading ? "—" : stockSummary.lowStock}</strong>
            </div>
            <div>
              <span>Hết hàng</span>
              <strong>{loading ? "—" : stockSummary.outOfStock}</strong>
            </div>
            <div>
              <span>SKU còn hàng</span>
              <strong>{loading ? "—" : stockSummary.inStock}</strong>
            </div>
          </div>
          <StockDonutChart
            inStock={stockSummary.inStock}
            lowStock={stockSummary.lowStock}
            outOfStock={stockSummary.outOfStock}
          />
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Cảnh báo tồn kho</h2>
            <Link to="/warehouses" className="dash-link">
              Vào kho
            </Link>
          </div>
          <ul className="activity-feed">
            {loading ? (
              <li className="activity-item">
                <p>Đang tải...</p>
              </li>
            ) : lowStockAlerts.length === 0 ? (
              <li className="activity-item activity-in">
                <span className="activity-dot" />
                <div>
                  <strong>Ổn định</strong>
                  <p>Không có SKU sắp hết hoặc hết hàng trong mẫu hiện tại.</p>
                </div>
              </li>
            ) : (
              lowStockAlerts.map((row) => (
                <li
                  key={`${row.id}-${row.sku}`}
                  className={`activity-item activity-${row.status === "out" ? "out" : "warn"}`}
                >
                  <span className="activity-dot" />
                  <div>
                    <strong>{row.sku}</strong>
                    <p>
                      {row.name} — còn {row.stock} sp
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="dash-card dash-table-card">
        <div className="dash-card-head">
          <div>
            <h2>Quản lý tồn kho chi tiết</h2>
            <p>Tồn khả dụng từ API sản phẩm (kho mặc định #1)</p>
          </div>
          <div className="dash-table-tools">
            <Link to="/warehouses/import" className="btn btn-secondary btn-sm">
              Nhập kho
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={exporting}
              onClick={() => void handleExportStock()}
            >
              <Download size={15} />
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Kho</th>
                <th>Tồn kho</th>
                <th>Nhập gần nhất</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="td-muted" style={{ textAlign: "center", padding: "2rem" }}>
                    Đang tải...
                  </td>
                </tr>
              ) : inventoryRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td-muted" style={{ textAlign: "center", padding: "2rem" }}>
                    Chưa có sản phẩm — <Link to="/products">thêm sản phẩm</Link>
                  </td>
                </tr>
              ) : (
                inventoryRows.map((row) => (
                  <tr key={`${row.id}-${row.sku}`}>
                    <td className="cell-title">{row.id}</td>
                    <td>
                      <div className="inv-product-cell">
                        {row.image ? <img src={row.image} alt="" /> : <span className="inv-thumb-placeholder" />}
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="td-muted">{row.sku}</td>
                    <td>{row.warehouse}</td>
                    <td>
                      <strong>{row.stock}</strong>
                    </td>
                    <td className="td-muted">{row.restock}</td>
                    <td>
                      <span className={`stock-badge stock-${row.status}`}>{statusLabel(row.status)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-pagination">
          <span>Trang 1 / 1</span>
          <div className="dash-pagination-btns">
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Trước
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
