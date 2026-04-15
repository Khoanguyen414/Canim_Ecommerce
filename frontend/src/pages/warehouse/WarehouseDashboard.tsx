import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { warehouseService } from "@/services/warehouse.service"
import { supplierService } from "@/services/supplier.service"
import type { InventoryRow, ReceiptReason, Supplier } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { getApiErrorMessage } from "@/lib/apiError"
import { Download } from "lucide-react"

const reasons: { value: ReceiptReason; label: string }[] = [
  { value: "PURCHASE", label: "Mua hàng" },
  { value: "RETURN_TO_SUPPLIER", label: "Trả NCC" },
  { value: "SALES_ORDER", label: "Bán hàng" },
  { value: "DAMAGE", label: "Hư hỏng" },
  { value: "STOCKTAKE_ADJUST", label: "Kiểm kê điều chỉnh" },
]

export default function WarehouseDashboard() {
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [inSupplierId, setInSupplierId] = useState<number | "">("")
  const [inNote, setInNote] = useState("")
  const [inProductId, setInProductId] = useState("")
  const [inQty, setInQty] = useState("")
  const [inPrice, setInPrice] = useState("")

  const [outReason, setOutReason] = useState<ReceiptReason>("SALES_ORDER")
  const [outNote, setOutNote] = useState("")
  const [outProductId, setOutProductId] = useState("")
  const [outQty, setOutQty] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [inv, sup] = await Promise.all([warehouseService.getInventory(), supplierService.getAll()])
      if (!inv.data.success || !inv.data.result) throw new Error(inv.data.message)
      if (!sup.data.success || !sup.data.result) throw new Error(sup.data.message)
      setRows(inv.data.result)
      setSuppliers(sup.data.result.filter((s) => s.active !== false))
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleExport = async () => {
    setMsg(null)
    try {
      const res = await warehouseService.exportInventoryExcel()
      const blob = res.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `KIEM_KE_${Date.now()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const handleInbound = async () => {
    setMsg(null)
    if (inSupplierId === "") {
      setMsg("Chọn nhà cung cấp")
      return
    }
    const pid = Number(inProductId)
    const qty = Number(inQty)
    const price = Number(inPrice)
    if (!Number.isFinite(pid) || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      setMsg("Thông tin nhập kho không hợp lệ")
      return
    }
    try {
      const { data } = await warehouseService.inbound({
        supplierId: Number(inSupplierId),
        note: inNote || undefined,
        items: [{ productId: pid, quantity: qty, price }],
      })
      if (!data.success) throw new Error(data.message)
      setMsg(data.message || "Nhập kho thành công")
      await load()
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const handleOutbound = async () => {
    setMsg(null)
    const pid = Number(outProductId)
    const qty = Number(outQty)
    if (!Number.isFinite(pid) || !Number.isFinite(qty) || qty <= 0) {
      setMsg("Thông tin xuất kho không hợp lệ")
      return
    }
    try {
      const { data } = await warehouseService.outbound({
        reason: outReason,
        note: outNote || undefined,
        items: [{ productId: pid, quantity: qty }],
      })
      if (!data.success) throw new Error(data.message)
      setMsg(data.message || "Xuất kho thành công")
      await load()
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  if (loading) return <LoadingSpinner label="Đang tải dữ liệu kho..." />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kho & kiểm kê</h1>
          <p className="text-muted-foreground">API `/warehouse/*` — vai trò ADMIN hoặc WAREHOUSE</p>
        </div>
        <Button variant="outline" type="button" onClick={() => void handleExport()}>
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel kiểm kê
        </Button>
      </div>

      {msg ? <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nhập kho (demo 1 dòng)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nhà cung cấp</label>
              <Select value={inSupplierId === "" ? "" : String(inSupplierId)} onChange={(e) => setInSupplierId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">— Chọn —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input placeholder="Ghi chú" value={inNote} onChange={(e) => setInNote(e.target.value)} />
            <Input placeholder="Product ID" value={inProductId} onChange={(e) => setInProductId(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Số lượng" value={inQty} onChange={(e) => setInQty(e.target.value)} />
              <Input placeholder="Đơn giá" value={inPrice} onChange={(e) => setInPrice(e.target.value)} />
            </div>
            <Button type="button" className="w-full" onClick={() => void handleInbound()}>
              Gửi nhập kho
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xuất kho (demo 1 dòng)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Lý do</label>
              <Select value={outReason} onChange={(e) => setOutReason(e.target.value as ReceiptReason)}>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input placeholder="Ghi chú" value={outNote} onChange={(e) => setOutNote(e.target.value)} />
            <Input placeholder="Product ID" value={outProductId} onChange={(e) => setOutProductId(e.target.value)} />
            <Input placeholder="Số lượng" value={outQty} onChange={(e) => setOutQty(e.target.value)} />
            <Button type="button" className="w-full" variant="secondary" onClick={() => void handleOutbound()}>
              Gửi xuất kho
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tồn kho</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4">Sản phẩm</th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2">SL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.productId}-${r.sku}`} className="border-b border-border/60">
                  <td className="py-2 pr-4">{r.productName}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.sku}</td>
                  <td className="py-2">{r.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <p className="py-6 text-center text-muted-foreground">Không có dữ liệu tồn kho.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
