import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  PackageMinus,
  PackagePlus,
  Search,
  Settings2,
  Warehouse,
} from "lucide-react"
import { CapacityDonutChart } from "@/components/warehouse/CapacityDonutChart"
import { RegionMapPanel } from "@/components/warehouse/RegionMapPanel"
import { UsageBarChart } from "@/components/warehouse/UsageBarChart"
import { Alert } from "@/components/ui/Alert"
import { warehouseService } from "@/services/warehouse.service"
import { getApiErrorMessage } from "@/lib/apiError"
import {
  DEFAULT_WAREHOUSE_ROWS,
  KPI_STATS,
  RECENT_ACTIVITIES,
  USAGE_BARS,
  enrichWarehouseFromApi,
  type WarehouseRow,
} from "@/pages/inventory/warehouse-hub-data"

const REGIONS_FILTER = ["Tất cả khu vực", "Hà Nội", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ", "Khánh Hòa"]

function KpiIcon({ kind }: { kind: (typeof KPI_STATS)[number]["icon"] }) {
  const props = { size: 22, strokeWidth: 1.75, "aria-hidden": true as const }
  switch (kind) {
    case "inbound":
      return <PackagePlus {...props} />
    case "outbound":
      return <PackageMinus {...props} />
    case "transfer":
      return <ArrowLeftRight {...props} />
    default:
      return <Warehouse {...props} />
  }
}

function ActivityIcon({ type }: { type: (typeof RECENT_ACTIVITIES)[number]["type"] }) {
  const props = { size: 16, strokeWidth: 2, "aria-hidden": true as const }
  if (type === "in") return <PackagePlus {...props} />
  if (type === "out") return <PackageMinus {...props} />
  if (type === "transfer") return <ArrowLeftRight {...props} />
  return <ClipboardList {...props} />
}

export function WarehouseHubPage() {
  const [rows, setRows] = useState<WarehouseRow[]>(DEFAULT_WAREHOUSE_ROWS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState(REGIONS_FILTER[0])
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await warehouseService.getAll()
      if (!data.success) throw new Error(data.message ?? "Không tải được kho")
      const apiRows = data.result ?? []
      if (apiRows.length > 0) {
        setRows(apiRows.map((w) => enrichWarehouseFromApi(w.id, w.name, w.address, w.isActive)))
      } else {
        setRows(DEFAULT_WAREHOUSE_ROWS)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows(DEFAULT_WAREHOUSE_ROWS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = useMemo(() => {
    let list = rows
    if (regionFilter !== REGIONS_FILTER[0]) {
      list = list.filter((r) => r.region === regionFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, regionFilter, search])

  const capacityTotals = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.capacity, 0)
    const used = rows.reduce((s, r) => s + r.used, 0)
    return { total, used }
  }, [rows])

  const usageBars = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.fillRate - a.fillRate)
        .slice(0, 6)
        .map((r) => ({ name: r.name, rate: r.fillRate })),
    [rows],
  )

  const kpiValues = useMemo(
    () => ({
      totalWarehouses: rows.length,
      inbound: KPI_STATS[1].value,
      outbound: KPI_STATS[2].value,
      transfer: KPI_STATS[3].value,
    }),
    [rows.length],
  )

  return (
    <div className="wh-page">
      <header className="wh-page-header">
        <div className="wh-page-header-main">
          <h1 className="wh-title">Kho hàng</h1>
          <nav className="wh-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} aria-hidden />
            <span>Tồn kho</span>
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page">Kho hàng</span>
          </nav>
        </div>
        <div className="wh-page-header-tools">
          <div className="wh-search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Tìm kiếm kho, khu vực..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm kho"
            />
            <kbd className="wh-search-kbd">⌘ K</kbd>
          </div>
          <Link to="/warehouses/manage" className="btn btn-secondary btn-sm">
            <Settings2 size={15} />
            Quản lý kho
          </Link>
        </div>
      </header>

      {error ? (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error} — đang hiển thị dữ liệu mẫu.
        </Alert>
      ) : null}

      <section className="wh-kpi-grid" aria-label="Chỉ số kho">
        {KPI_STATS.map((kpi, i) => {
          const value =
            i === 0
              ? kpiValues.totalWarehouses
              : i === 1
                ? kpiValues.inbound
                : i === 2
                  ? kpiValues.outbound
                  : kpiValues.transfer
          return (
            <article key={kpi.label} className="wh-kpi-card">
              <div className="wh-kpi-icon">
                <KpiIcon kind={kpi.icon} />
              </div>
              <div className="wh-kpi-body">
                <p className="wh-kpi-label">{kpi.label}</p>
                <p className="wh-kpi-value">{value}</p>
                <p className="wh-kpi-trend">
                  <ArrowUpRight size={14} aria-hidden />
                  {kpi.trend}% {kpi.trendLabel}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      <div className="wh-layout">
        <div className="wh-main-col">
          <section className="wh-card wh-table-card">
            <div className="wh-card-head">
              <h2>Tổng quan kho hàng</h2>
              <div className="wh-card-actions">
                <select
                  className="wh-select"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  aria-label="Lọc khu vực"
                >
                  {REGIONS_FILTER.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary btn-sm">
                  <Filter size={15} />
                  Lọc
                </button>
                <button type="button" className="btn btn-secondary btn-sm">
                  <Download size={15} />
                  Xuất Excel
                </button>
              </div>
            </div>

            <div className="wh-table-wrap">
              <table className="wh-table">
                <thead>
                  <tr>
                    <th>Mã kho</th>
                    <th>Tên kho</th>
                    <th>Khu vực</th>
                    <th>Sức chứa</th>
                    <th>Hiện có</th>
                    <th>Tỷ lệ lấp đầy</th>
                    <th>Quản lý</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="wh-table-empty">
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="wh-table-empty">
                        Không có kho phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <code className="wh-code">{row.code}</code>
                        </td>
                        <td className="wh-cell-name">{row.name}</td>
                        <td>{row.region}</td>
                        <td>{row.capacity.toLocaleString("vi-VN")} m²</td>
                        <td>{row.used.toLocaleString("vi-VN")} m²</td>
                        <td>
                          <div className="wh-fill-cell">
                            <div className="wh-fill-track">
                              <div className="wh-fill-bar" style={{ width: `${row.fillRate}%` }} />
                            </div>
                            <span>{row.fillRate}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="wh-manager">
                            <img src={row.manager.avatar} alt="" width={28} height={28} />
                            <span>{row.manager.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`wh-status wh-status-${row.status}`}>
                            <span className="wh-status-dot" />
                            {row.status === "active" ? "Hoạt động" : "Bảo trì"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="wh-table-footer">
              <span>
                Hiển thị 1 đến {filteredRows.length} trong tổng số {rows.length} kho
              </span>
              <select className="wh-select wh-select-sm" defaultValue="10" aria-label="Số dòng mỗi trang">
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
              </select>
            </footer>
          </section>

          <section className="wh-charts-grid" aria-label="Biểu đồ kho">
            <article className="wh-card wh-chart-card">
              <h3>Tỷ lệ sử dụng sức chứa</h3>
              <CapacityDonutChart used={capacityTotals.used} total={capacityTotals.total} />
            </article>
            <article className="wh-card wh-chart-card">
              <h3>Kho sử dụng cao nhất</h3>
              <UsageBarChart items={usageBars.length ? usageBars : USAGE_BARS} />
            </article>
            <article className="wh-card wh-chart-card">
              <h3>Phân bổ theo khu vực</h3>
              <RegionMapPanel />
            </article>
          </section>
        </div>

        <aside className="wh-side-col">
          <section className="wh-card">
            <h3>Hoạt động kho gần đây</h3>
            <ul className="wh-activity-list">
              {RECENT_ACTIVITIES.map((act) => (
                <li key={act.ref} className={`wh-activity wh-activity-${act.type}`}>
                  <span className="wh-activity-icon">
                    <ActivityIcon type={act.type} />
                  </span>
                  <div>
                    <p className="wh-activity-title">
                      {act.title} <span>{act.ref}</span>
                    </p>
                    <p className="wh-activity-detail">{act.detail}</p>
                    <time>{act.time}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="wh-card wh-quick-card">
            <h3>Thao tác nhanh</h3>
            <div className="wh-quick-actions">
              <button type="button" className="btn btn-primary wh-quick-primary">
                <PackagePlus size={18} />
                Tạo phiếu nhập
              </button>
              <button type="button" className="btn btn-outline-gold">
                <PackageMinus size={18} />
                Tạo phiếu xuất
              </button>
              <button type="button" className="btn btn-outline-gold">
                <ArrowLeftRight size={18} />
                Điều chuyển kho
              </button>
              <button type="button" className="btn btn-outline-gold">
                <ClipboardList size={18} />
                Kiểm kê
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
