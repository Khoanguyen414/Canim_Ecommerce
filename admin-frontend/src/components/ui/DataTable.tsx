import type { ReactNode } from "react"

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: "left" | "right"
  className?: string
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey: (row: T) => string | number
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "Không có dữ liệu",
  rowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card">
        <div className="table-loading">
          <div className="spinner spinner-lg" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ textAlign: col.align ?? "left" }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className} style={{ textAlign: col.align ?? "left" }}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
