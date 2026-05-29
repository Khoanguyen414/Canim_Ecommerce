import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { warehouseService, inventoryService } from "@/services/warehouse.service"
import { supplierService } from "@/services/supplier.service"
import { stockCheckService } from "@/services/stockCheck.service"
import type { ProductDetail, Supplier, Warehouse } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { getApiErrorMessage } from "@/lib/apiError"
import { hasAppRole } from "@/lib/roles"
import { useAuthStore } from "@/store/auth.store"
import { Download } from "lucide-react"

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL ?? "http://localhost:5174"

type VariantOption = {
  variantId: number
  sku: string
  label: string
  availableQty: number
}

function flattenVariants(products: ProductDetail[]): VariantOption[] {
  const options: VariantOption[] = []
  for (const p of products) {
    for (const v of p.variants ?? []) {
      if (!v.id || !v.sku) continue
      options.push({
        variantId: v.id,
        sku: v.sku,
        label: `${p.name} — ${[v.sku, v.color, v.size].filter(Boolean).join(" / ")}`,
        availableQty: Number(v.quantity ?? 0),
      })
    }
  }
  return options.sort((a, b) => a.sku.localeCompare(b.sku))
}

export default function WarehouseDashboard() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = hasAppRole(user?.roles, "ADMIN")

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [warehouseId, setWarehouseId] = useState<number | "">("")

  const [inSupplierId, setInSupplierId] = useState<number | "">("")
  const [inNote, setInNote] = useState("")
  const [inVariantId, setInVariantId] = useState<number | "">("")
  const [inQty, setInQty] = useState("")
  const [inPrice, setInPrice] = useState("")

  const [outNote, setOutNote] = useState("")
  const [outOrderId, setOutOrderId] = useState("")
  const [outVariantId, setOutVariantId] = useState<number | "">("")
  const [outQty, setOutQty] = useState("")

  const [scVariantId, setScVariantId] = useState<number | "">("")
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
      const wPromise = warehouseService.list()
      const supPromise = supplierService.getAll()
      const [w, sup] = await Promise.all([wPromise, supPromise])
      if (!w.data.success || !w.data.result) throw new Error(w.data.message)
      if (!sup.data.success || !sup.data.result) throw new Error(sup.data.message)
      setWarehouses(w.data.result)
      setSuppliers(sup.data.result.filter((s) => s.isActive !== false))
      const firstWh = w.data.result[0]?.id
      if (firstWh != null && warehouseId === "") setWarehouseId(firstWh)

      if (isAdmin) {
        const prod = await warehouseService.listProductsForPicker()
        if (prod.data.success && prod.data.result?.data) {
          setVariantOptions(flattenVariants(prod.data.result.data))
        }
      } else {
        setVariantOptions([])
      }
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [isAdmin])

  const selectedInboundVariant = useMemo(
    () => (inVariantId !== "" ? variantOptions.find((v) => v.variantId === inVariantId) : undefined),
    [inVariantId, variantOptions],
  )

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
    if (inVariantId === "") {
      setMsg("Chọn biến thể sản phẩm")
      return
    }
    const qty = Number(inQty)
    const price = Number(inPrice)
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      setMsg("Nhập số lượng và đơn giá hợp lệ")
      return
    }
    try {
      const { data } = await inventoryService.inbound({
        warehouseId: whId,
        supplierId: Number(inSupplierId),
        note: inNote || undefined,
        items: [{ variantId: Number(inVariantId), quantity: qty, price }],
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
    if (outVariantId === "") {
      setMsg("Chọn biến thể sản phẩm")
      return
    }
    const qty = Number(outQty)
    if (!Number.isFinite(qty) || qty <= 0) {
      setMsg("Nhập số lượng hợp lệ")
      return
    }
    const oid = outOrderId.trim() ? Number(outOrderId) : undefined
    try {
      const { data } = await inventoryService.outbound({
        warehouseId: whId,
        orderId: Number.isFinite(oid) ? oid : undefined,
        note: outNote || undefined,
        items: [{ variantId: Number(outVariantId), quantity: qty }],
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
    if (scVariantId === "") {
      setMsg("Chọn biến thể")
      return
    }
    const sys = Number(scSystemQty)
    const act = Number(scActualQty)
    if (!Number.isFinite(sys) || !Number.isFinite(act) || sys < 0 || act < 0) {
      setMsg("Nhập tồn hệ thống và tồn thực tế (≥ 0)")
      return
    }
    try {
      const { data } = await stockCheckService.create({
        warehouseId: whId,
        note: scNote.trim() || undefined,
        items: [
          {
            variantId: Number(scVariantId),
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
      await load()
    } catch (e) {
      setMsg(getApiErrorMessage(e))
    }
  }

  const onStockVariantChange = (id: number | "") => {
    setScVariantId(id)
    if (id !== "") {
      const v = variantOptions.find((o) => o.variantId === id)
      if (v) setScSystemQty(String(v.availableQty))
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
            Giao diện tối giản trên shop. Quản lý kho đầy đủ:{" "}
            <a href={ADMIN_APP_URL} className="underline" target="_blank" rel="noreferrer">
              Admin panel
            </a>
            .
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
          Tồn theo SKU lấy từ API sản phẩm (kho mặc định #1). Chi tiết lô hàng: file{" "}
          <strong>Xuất Excel tồn kho</strong>.
          {!isAdmin ? (
            <>
              {" "}
              Tài khoản WAREHOUSE: nhập Variant ID thủ công hoặc dùng Admin (ROLE_ADMIN) để chọn SKU.
            </>
          ) : null}
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
            {variantOptions.length > 0 ? (
              <Select
                value={scVariantId === "" ? "" : String(scVariantId)}
                onChange={(e) => onStockVariantChange(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">— Chọn SKU —</option>
                {variantOptions.map((o) => (
                  <option key={o.variantId} value={o.variantId}>
                    {o.label} (tồn: {o.availableQty})
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Variant ID"
                value={scVariantId === "" ? "" : String(scVariantId)}
                onChange={(e) => setScVariantId(e.target.value ? Number(e.target.value) : "")}
              />
            )}
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
            <Input placeholder="Ghi chú" value={inNote} onChange={(e) => setInNote(e.target.value)} />
            {variantOptions.length > 0 ? (
              <div>
                <label className="text-sm font-medium">Biến thể</label>
                <Select
                  value={inVariantId === "" ? "" : String(inVariantId)}
                  onChange={(e) => setInVariantId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">— Chọn SKU —</option>
                  {variantOptions.map((o) => (
                    <option key={o.variantId} value={o.variantId}>
                      {o.label} (tồn: {o.availableQty})
                    </option>
                  ))}
                </Select>
                {selectedInboundVariant ? (
                  <p className="mt-1 text-xs text-muted-foreground">SKU: {selectedInboundVariant.sku}</p>
                ) : null}
              </div>
            ) : (
              <Input
                placeholder="Variant ID"
                value={inVariantId === "" ? "" : String(inVariantId)}
                onChange={(e) => setInVariantId(e.target.value ? Number(e.target.value) : "")}
              />
            )}
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
            <Input placeholder="Ghi chú" value={outNote} onChange={(e) => setOutNote(e.target.value)} />
            <Input
              placeholder="Order ID (tuỳ chọn, gắn phiếu xuất với đơn)"
              value={outOrderId}
              onChange={(e) => setOutOrderId(e.target.value)}
            />
            {variantOptions.length > 0 ? (
              <div>
                <label className="text-sm font-medium">Biến thể</label>
                <Select
                  value={outVariantId === "" ? "" : String(outVariantId)}
                  onChange={(e) => setOutVariantId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">— Chọn SKU —</option>
                  {variantOptions.map((o) => (
                    <option key={o.variantId} value={o.variantId}>
                      {o.label} (tồn: {o.availableQty})
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <Input
                placeholder="Variant ID"
                value={outVariantId === "" ? "" : String(outVariantId)}
                onChange={(e) => setOutVariantId(e.target.value ? Number(e.target.value) : "")}
              />
            )}
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
