import { Link } from "react-router-dom"
import { cn } from "@/lib/cn"

export type ShopSidebarProduct = {
  id: string | number
  name: string
  priceLabel: string
  imageUrl?: string
  href: string
}

type ShopSidebarProps = {
  newProducts?: ShopSidebarProduct[]
  className?: string
}

/** Cột phụ: sản phẩm mới / gợi ý (không khối lọc demo). */
export function ShopSidebar({ newProducts, className }: ShopSidebarProps) {
  return (
    <aside
      className={cn(
        "w-full shrink-0 space-y-6 lg:w-[260px]",
        /* Cột trái bám viewport khi cuộn (dưới header sticky ~6rem) */
        "lg:sticky lg:top-24 lg:z-10 lg:self-start",
        className,
      )}
    >
      <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-stone-600">Hàng mới</h3>
        {newProducts?.length ? (
          <ul className="space-y-4">
            {newProducts.map((p) => (
              <li key={p.id}>
                <Link to={p.href} className="flex gap-3 rounded-xl p-1 transition-colors hover:bg-stone-50">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/60">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-stone-400">No img</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-stone-900">{p.name}</p>
                    <p className="mt-1 text-sm font-bold text-teal-800">{p.priceLabel}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">Sản phẩm từ catalog sẽ hiện ở đây.</p>
        )}
      </div>
    </aside>
  )
}
