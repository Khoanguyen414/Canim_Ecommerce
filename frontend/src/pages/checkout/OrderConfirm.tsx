import { useMemo, useState } from "react"
import { CheckCircle, Package, ArrowRight, Pencil, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useOrderStore, type PlacedOrder } from "@/store/order.store"
import { formatVnd } from "@/lib/format"
import { EmptyState } from "@/components/common/EmptyState"
import { ShoppingBag } from "lucide-react"
import { deliverySummaryFromCustomer, validateCustomerForm, type CustomerFormFields } from "@/lib/checkoutCustomer"
import { cn } from "@/lib/cn"

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  card: "Thẻ ngân hàng",
}

function orderToCustomerForm(order: PlacedOrder): CustomerFormFields {
  return {
    fullName: order.customerName ?? "",
    email: order.customerEmail ?? "",
    phone: order.customerPhone ?? "",
    address: order.customerAddress ?? "",
    city: order.customerCity ?? "",
    district: order.customerDistrict ?? "",
    ward: order.customerWard ?? "",
  }
}

export default function OrderConfirm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = useOrderStore((s) => (id ? s.getById(id) : undefined))
  const updateOrder = useOrderStore((s) => s.updateOrder)
  const cancelOrder = useOrderStore((s) => s.cancelOrder)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<CustomerFormFields | null>(null)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const paymentLabel = useMemo(
    () => (order ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod : ""),
    [order],
  )

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Không tìm thấy đơn hàng"
          description="Mã đơn không tồn tại trong bộ nhớ cục bộ của trình duyệt này."
          actionLabel="Về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    )
  }

  const created = new Date(order.createdAt)
  const isCancelled = order.status === "cancelled"

  const startEdit = () => {
    setEditForm(orderToCustomerForm(order))
    setEditErrors({})
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditForm(null)
    setEditErrors({})
  }

  const saveEdit = () => {
    if (!editForm) return
    const errs = validateCustomerForm(editForm)
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    const deliverySummary = deliverySummaryFromCustomer(editForm)
    updateOrder(order.id, {
      customerName: editForm.fullName.trim(),
      customerEmail: editForm.email.trim(),
      customerPhone: editForm.phone.trim(),
      customerAddress: editForm.address.trim(),
      customerWard: editForm.ward.trim(),
      customerDistrict: editForm.district.trim(),
      customerCity: editForm.city.trim(),
      deliverySummary,
    })
    setEditing(false)
    setEditForm(null)
    setEditErrors({})
  }

  const handleCancelOrder = () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này? Thao tác không thể hoàn tác trên thiết bị này.")) return
    cancelOrder(order.id)
    navigate("/orders")
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : prev))
    if (editErrors[name]) {
      setEditErrors((prev) => {
        const n = { ...prev }
        delete n[name]
        return n
      })
    }
  }

  const hasStructured = Boolean(order.customerName || order.customerPhone)

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          {isCancelled ? (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Ban className="h-8 w-8 text-destructive" />
            </div>
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          )}
          <h1 className="text-3xl font-bold">{isCancelled ? "Đơn đã hủy" : "Đặt hàng thành công"}</h1>
          <p className="text-lg text-muted-foreground">
            {isCancelled
              ? "Đơn hàng đã được đánh dấu hủy trong lịch sử của bạn."
              : "Cảm ơn bạn. Vui lòng kiểm tra lại thông tin nhận hàng bên dưới — có thể chỉnh sửa nếu sai."}
          </p>
        </div>

        <Card className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn</p>
              <p className="text-lg font-bold">{order.orderCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt</p>
              <p className="text-lg font-bold">
                {created.toLocaleDateString("vi-VN")}{" "}
                {created.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="text-lg font-bold text-primary">{formatVnd(order.total)}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-base font-semibold text-[#253d4e]">Thông tin nhận hàng</h3>

            {!isCancelled && editing && editForm ? (
              <div className="space-y-3">
                {Object.keys(editErrors).length > 0 ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    <ul className="list-disc pl-4">
                      {Object.entries(editErrors).map(([k, msg]) => (
                        <li key={k}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    placeholder="Họ và tên *"
                    className={cn(editErrors.fullName && "border-destructive")}
                  />
                  <Input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Email (tuỳ chọn)"
                    className={cn(editErrors.email && "border-destructive")}
                  />
                </div>
                <Input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  placeholder="Số điện thoại *"
                  className={cn(editErrors.phone && "border-destructive")}
                />
                <Input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  placeholder="Địa chỉ *"
                  className={cn(editErrors.address && "border-destructive")}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    name="ward"
                    value={editForm.ward}
                    onChange={handleEditChange}
                    placeholder="Phường / Xã *"
                    className={cn(editErrors.ward && "border-destructive")}
                  />
                  <Input
                    name="district"
                    value={editForm.district}
                    onChange={handleEditChange}
                    placeholder="Quận / Huyện *"
                    className={cn(editErrors.district && "border-destructive")}
                  />
                  <Input
                    name="city"
                    value={editForm.city}
                    onChange={handleEditChange}
                    placeholder="Tỉnh / Thành *"
                    className={cn(editErrors.city && "border-destructive")}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" onClick={saveEdit}>
                    Lưu thay đổi
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Huỷ chỉnh sửa
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="grid gap-2 text-sm">
                {hasStructured ? (
                  <>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="min-w-[8rem] font-medium text-muted-foreground">Họ tên</dt>
                      <dd className="text-[#253d4e]">{order.customerName || "—"}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="min-w-[8rem] font-medium text-muted-foreground">Điện thoại</dt>
                      <dd className="text-[#253d4e]">{order.customerPhone || "—"}</dd>
                    </div>
                    {order.customerEmail ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                        <dt className="min-w-[8rem] font-medium text-muted-foreground">Email</dt>
                        <dd className="text-[#253d4e]">{order.customerEmail}</dd>
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="min-w-[8rem] font-medium text-muted-foreground">Địa chỉ</dt>
                      <dd className="text-[#253d4e]">
                        {[order.customerAddress, order.customerWard, order.customerDistrict, order.customerCity]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt className="font-medium text-muted-foreground">Ghi chú giao hàng</dt>
                    <dd className="mt-1 text-[#253d4e]">{order.deliverySummary || "—"}</dd>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Đơn tạo từ phiên bản trước — không chỉnh sửa từng trường được. Cần đổi địa chỉ, vui lòng huỷ đơn và đặt lại.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-0.5 border-t border-border pt-3 sm:flex-row sm:gap-2">
                  <dt className="min-w-[8rem] font-medium text-muted-foreground">Vận chuyển</dt>
                  <dd className="text-[#253d4e]">{order.shippingMethodName || "—"}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                  <dt className="min-w-[8rem] font-medium text-muted-foreground">Thanh toán</dt>
                  <dd className="text-[#253d4e]">{paymentLabel}</dd>
                </div>
              </dl>
            )}

            {!isCancelled ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {!editing ? (
                  <>
                    {hasStructured ? (
                      <Button type="button" variant="outline" onClick={startEdit} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa thông tin giao hàng
                      </Button>
                    ) : null}
                    <Button type="button" variant="destructive" onClick={handleCancelOrder} className="gap-2">
                      <Ban className="h-4 w-4" />
                      Huỷ đơn hàng
                    </Button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Package className="h-5 w-5" />
              Sản phẩm
            </h3>
            <ul className="space-y-2 text-sm">
              {order.items.map((i) => (
                <li key={i.lineId} className="flex justify-between gap-2">
                  <span className="line-clamp-2">
                    {i.productName} × {i.quantity}
                  </span>
                  <span className="shrink-0">{formatVnd(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
          <Button variant="outline" asChild>
            <Link to="/orders">
              Xem lịch sử đơn
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
