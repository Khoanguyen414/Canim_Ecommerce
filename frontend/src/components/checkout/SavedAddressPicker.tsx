import { MapPin, Star } from "lucide-react"
import { cn } from "@/lib/cn"
import type { UserAddressDto } from "@/types/api.types"

export type AddressCheckoutMode = "manual" | "saved" | "default"

type Props = {
  addresses: UserAddressDto[]
  mode: AddressCheckoutMode
  selectedAddressId: number | null
  onModeChange: (mode: AddressCheckoutMode) => void
  onSelectAddress: (id: number) => void
}

export function SavedAddressPicker({
  addresses,
  mode,
  selectedAddressId,
  onModeChange,
  onSelectAddress,
}: Props) {
  const defaultAddr = addresses.find((a) => a.isDefault)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Địa chỉ giao hàng</p>

      <div className="flex flex-wrap gap-2">
        <label
          className={cn(
            "cursor-pointer rounded-lg border px-3 py-2 text-sm",
            mode === "default" && defaultAddr
              ? "border-primary bg-primary/5"
              : "border-border",
            !defaultAddr && "opacity-50",
          )}
        >
          <input
            type="radio"
            name="addressMode"
            className="sr-only"
            disabled={!defaultAddr}
            checked={mode === "default"}
            onChange={() => onModeChange("default")}
          />
          Dùng địa chỉ mặc định
        </label>
        <label
          className={cn(
            "cursor-pointer rounded-lg border px-3 py-2 text-sm",
            mode === "saved" ? "border-primary bg-primary/5" : "border-border",
            addresses.length === 0 && "opacity-50",
          )}
        >
          <input
            type="radio"
            name="addressMode"
            className="sr-only"
            disabled={addresses.length === 0}
            checked={mode === "saved"}
            onChange={() => onModeChange("saved")}
          />
          Chọn địa chỉ đã lưu
        </label>
        <label
          className={cn(
            "cursor-pointer rounded-lg border px-3 py-2 text-sm",
            mode === "manual" ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <input
            type="radio"
            name="addressMode"
            className="sr-only"
            checked={mode === "manual"}
            onChange={() => onModeChange("manual")}
          />
          Nhập địa chỉ mới
        </label>
      </div>

      {mode === "saved" && addresses.length > 0 ? (
        <ul className="space-y-2">
          {addresses.map((addr) => (
            <li key={addr.id}>
              <button
                type="button"
                onClick={() => onSelectAddress(addr.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition",
                  selectedAddressId === addr.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/50",
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {addr.receiverName} · {addr.receiverPhone}
                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">
                      <Star className="h-3 w-3 fill-current" />
                      Mặc định
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-muted-foreground">{addr.fullAddress}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {mode === "default" && defaultAddr ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-sm">
          <p className="font-medium">{defaultAddr.receiverName}</p>
          <p className="text-muted-foreground">{defaultAddr.fullAddress}</p>
        </div>
      ) : null}
    </div>
  )
}
