import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { warehouseService, inventoryService } from "@/services/warehouse.service"
import { supplierService } from "@/services/supplier.service"
import { stockCheckService } from "@/services/stockCheck.service"
import type { ReceiptReason, Supplier, Warehouse } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { getApiErrorMessage } from "@/lib/apiError"
import { Download } from "lucide-react"

const inboundReasons: { value: string; label: string }[] = [
  { value: "PURCHASE", label: "Mua hàng (PURCHASE)" },
  { value: "RETURN_FROM_CUSTOMER", label: "Khách trả hàng" },
  { value: "STOCKTAKE_ADJUST", label: "Kiểm kê điều chỉnh" },
]

const outboundReasons: { value: ReceiptReason; label: string }[] = [
  { value: "SALES_ORDER", label: "Bán hàng" },
  { value: "RETURN_TO_SUPPLIER", label: "Trả NCC" },
  { value: "DAMAGE", label: "Hư hỏng" },
  { value: "STOCKTAKE_ADJUST", label: "Kiểm kê điều chỉnh" },
]

export default function WarehouseDashboard() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [warehouseId, setWarehouseId] = useState<number | "">("")

  const [inSupplierId, setInSupplierId] = useState<number | "">("")
  const [inReason, setInReason] = useState("PURCHASE")
  const [inNote, setInNote] = useState("")
  const [inVariantId, setInVariantId] = useState("")
  const [inQty, setInQty] = useState("")
  const [inPrice, setInPrice] = useState("")

  const [outReason, setOutReason] = useState<ReceiptReason>("SALES_ORDER")
  const [outNote, setOutNote] = useState("")
  const [outOrderId, setOutOrderId] = useState("")
  const [outVariantId, setOutVariantId] = useState("")
  const [outQty, setOutQty] = useState("")

  const [scVariantId, setScVariantId] = useState("")
  const [scSystemQty, setScSystemQty] = useState("")
  const [scActualQty, setScActualQty] = useState("")
  const [scNote, setScNote] = useState("")
  const [scItemReason, setScItemReason] = useState("")
  const [lastCheckId, setLastCheckId] = useState<number | null>(null)
  const [lastCheckCode, setLastCheckCode] = useState<string | null>(null)
  const [completeIdInput, setCompleteIdInput] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [w, sup] = await Promise.all([warehouseService.list(), supplierService.getAll()])
      if (!w.data.success || !w.data.result) throw new Error(w.data.message)
      if (!sup.data.success || !sup.data.result) throw new Error(sup.data.message)
      setWarehouses(w.data.result)
      setSuppliers(sup.data.result.filter((s) => s.isActive !== false))
      const firstWh = w.data.result[0]?.id
      if (firstWh != null && warehouseId === "") setWarehouseId(firstWh)
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
      const res = await inventoryService.exportExcel()
      const blob = res.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Bao_Cao_Ton_Kho_${Date.now()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      setMsg("Đã tải file Excel tồn kho từ server.")
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const resolvedWarehouseId = (): number | null => {
    if (warehouseId !== "") return Number(warehouseId)
    const f = warehouses[0]?.id
    return f != null ? f : null
  }

  const handleInbound = async () => {
    setMsg(null)
    const whId = resolvedWarehouseId()
    if (whId == null) {
      setMsg("Chưa có kho — tạo kho trong ứng dụng quản trị trước.")
      return
    }
    if (inSupplierId === "") {
      setMsg("Chọn nhà cung cấp")
      return
    }
    const vid = Number(inVariantId)
    const qty = Number(inQty)
    const price = Number(inPrice)
    if (!Number.isFinite(vid) || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      setMsg("Nhập variant ID, số lượng và đơn giá hợp lệ")
      return
    }
    try {
      const { data } = await inventoryService.inbound({
        warehouseId: whId,
        supplierId: Number(inSupplierId),
        reasonCode: inReason,
        note: inNote || undefined,
        items: [{ variantId: vid, quantity: qty, price }],
      })
      if (!data.success) throw new Error(data.message)
      setMsg(data.message || "Nhập kho thành công")
      setInVariantId("")
      setInQty("")
      setInPrice("")
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const handleOutbound = async () => {
    setMsg(null)
    const whId = resolvedWarehouseId()
    if (whId == null) {
      setMsg("Chưa có kho.")
      return
    }
    const vid = Number(outVariantId)
    const qty = Number(outQty)
    if (!Number.isFinite(vid) || !Number.isFinite(qty) || qty <= 0) {
      setMsg("Nhập variant ID và số lượng hợp lệ")
      return
    }
    const oid = outOrderId.trim() ? Number(outOrderId) : undefined
    try {
      const { data } = await inventoryService.outbound({
        warehouseId: whId,
        reasonCode: outReason,
        orderId: Number.isFinite(oid) ? oid : undefined,
        note: outNote || undefined,
        items: [{ variantId: vid, quantity: qty }],
      })
      if (!data.success) throw new Error(data.message)
      setMsg(data.message || "Xuất kho thành công")
      setOutVariantId("")
      setOutQty("")
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const handleStockCheckDraft = async () => {
    setMsg(null)
    const whId = resolvedWarehouseId()
    if (whId == null) {
      setMsg("Chưa có kho.")
      return
    }
    const vid = Number(scVariantId)
    const sys = Number(scSystemQty)
    const act = Number(scActualQty)
    if (!Number.isFinite(vid) || !Number.isFinite(sys) || !Number.isFinite(act) || sys < 0 || act < 0) {
      setMsg("Nhập Variant ID, tồn hệ thống và tồn thực tế (≥ 0)")
      return
    }
    try {
      const { data } = await stockCheckService.create({
        warehouseId: whId,
        note: scNote.trim() || undefined,
        items: [
          {
            variantId: vid,
            systemQuantity: Math.floor(sys),
            actualQuantity: Math.floor(act),
            reason: scItemReason.trim() || undefined,
          },
        ],
      })
      if (!data.success || !data.result) throw new Error(data.message || "Tạo phiếu thất bại")
      setLastCheckId(data.result.id)
      setLastCheckCode(data.result.code)
      setMsg(`Đã tạo phiếu kiểm kê ${data.result.code} (DRAFT). Có thể hoàn tất bên dưới.`)
      setScVariantId("")
      setScSystemQty("")
      setScActualQty("")
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const handleStockCheckComplete = async () => {
    setMsg(null)
    const manual = completeIdInput.trim() ? Number(completeIdInput.trim()) : NaN
    const id = lastCheckId ?? (Number.isFinite(manual) ? manual : NaN)
    if (!Number.isFinite(id)) {
      setMsg("Tạo phiếu DRAFT trước, hoặc nhập ID phiếu vào ô bên dưới rồi hoàn tất.")
      return
    }
    try {
      const { data } = await stockCheckService.complete(id)
      if (!data.success) throw new Error(data.message || "Hoàn tất thất bại")
      setMsg(data.message || `Đã hoàn tất phiếu #${id}`)
      if (lastCheckId === id) {
        setLastCheckId(null)
        setLastCheckCode(null)
      }
      setCompleteIdInput("")
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  if (loading) return <LoadingSpinner label="Đang tải dữ liệu kho..." />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kho &amp; tồn kho</h1>
          <p className="text-muted-foreground">
            API: <code className="text-xs">/warehouses</code>, <code className="text-xs">/inventory/*</code>,{" "}
            <code className="text-xs">/suppliers</code>, <code className="text-xs">/stock-checks</code> — ADMIN hoặc
            WAREHOUSE.
          </p>
        </div>
        <Button variant="outline" type="button" onClick={() => void handleExport()}>
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel tồn kho
        </Button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Kho làm việc</label>
        <Select
          value={warehouseId === "" ? "" : String(warehouseId)}
          onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
          className="max-w-md"
        >
          <option value="">— Chọn kho —</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
      </div>

      {msg ? <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm">{msg}</p> : null}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Tồn kho theo dòng</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Backend hiện <strong>không có</strong> API GET danh sách tồn từng SKU. Xem số liệu trong file{" "}
          <strong>Xuất Excel tồn kho</strong> ở trên. Nhập/xuất dùng <strong>Variant ID</strong> (từ ứng dụng quản trị hoặc bảng{" "}
          <code className="text-xs">product_variants</code>).
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kiểm kê kho (1 dòng)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Tạo phiếu DRAFT với một biến thể, so sánh <strong>tồn hệ thống</strong> và <strong>tồn thực tế</strong>, sau đó
            bấm hoàn tất để ghi nhận điều chỉnh (theo luật backend).
          </p>
          <Input placeholder="Ghi chú phiếu" value={scNote} onChange={(e) => setScNote(e.target.value)} />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Variant ID" value={scVariantId} onChange={(e) => setScVariantId(e.target.value)} />
            <Input
              placeholder="Tồn hệ thống"
              value={scSystemQty}
              onChange={(e) => setScSystemQty(e.target.value)}
            />
            <Input placeholder="Tồn thực tế" value={scActualQty} onChange={(e) => setScActualQty(e.target.value)} />
            <Input
              placeholder="Lý do dòng (tuỳ chọn)"
              value={scItemReason}
              onChange={(e) => setScItemReason(e.target.value)}
            />
          </div>
          <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">ID phiếu (nếu cần hoàn tất thủ công)</label>
              <Input
                placeholder="VD: 12"
                value={completeIdInput}
                onChange={(e) => setCompleteIdInput(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void handleStockCheckDraft()}>
              Tạo phiếu DRAFT
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleStockCheckComplete()}>
              Hoàn tất phiếu
            </Button>
          </div>
          {lastCheckId != null ? (
            <p className="text-xs text-muted-foreground">
              Phiếu chờ hoàn tất: <strong>{lastCheckCode ?? `#${lastCheckId}`}</strong> (ID {lastCheckId})
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nhập kho (1 dòng)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nhà cung cấp</label>
              <Select
                value={inSupplierId === "" ? "" : String(inSupplierId)}
                onChange={(e) => setInSupplierId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">— Chọn —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Lý do (reasonCode)</label>
              <Select value={inReason} onChange={(e) => setInReason(e.target.value)}>
                {inboundReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input placeholder="Ghi chú" value={inNote} onChange={(e) => setInNote(e.target.value)} />
            <Input placeholder="Variant ID" value={inVariantId} onChange={(e) => setInVariantId(e.target.value)} />
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
            <CardTitle>Xuất kho (1 dòng)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Lý do (reasonCode)</label>
              <Select value={outReason} onChange={(e) => setOutReason(e.target.value as ReceiptReason)}>
                {outboundReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input placeholder="Ghi chú" value={outNote} onChange={(e) => setOutNote(e.target.value)} />
            <Input
              placeholder="Order ID (tuỳ chọn, gắn phiếu xuất với đơn)"
              value={outOrderId}
              onChange={(e) => setOutOrderId(e.target.value)}
            />
            <Input placeholder="Variant ID" value={outVariantId} onChange={(e) => setOutVariantId(e.target.value)} />
            <Input placeholder="Số lượng" value={outQty} onChange={(e) => setOutQty(e.target.value)} />
            <Button type="button" className="w-full" variant="secondary" onClick={() => void handleOutbound()}>
              Gửi xuất kho
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
