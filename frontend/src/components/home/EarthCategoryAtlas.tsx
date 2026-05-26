import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import type { CategoryNode } from "@/types/api.types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"

type Props = {
  categories: CategoryNode[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

/** Dải danh mục kiểu “earth / 2026”: nền trầm, glass, không badge số. */
export function EarthCategoryAtlas({ categories, loading, error, onRetry }: Props) {
  return (
    <section className="relative overflow-hidden py-20 md:py-24" aria-labelledby="earth-atlas-heading">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(45,212,191,0.22),transparent_50%),linear-gradient(168deg,#0c1222_0%,#134e4a_38%,#1c1410_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-teal-500/20 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-600/15 blur-[90px]" aria-hidden />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-teal-200/85">Earth catalog · 2026</p>
          <h2 id="earth-atlas-heading" className="mt-5 text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.1]">
            Khám phá theo tuyến
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-stone-300/95 md:text-base">
            Chọn một danh mục để xem ngay các sản phẩm tương ứng — mua sắm gọn, đúng nhu cầu.
          </p>
        </div>

        {loading ? (
          <div className="mt-14 flex justify-center">
            <LoadingSpinner
              label="Đang tải danh mục…"
              className="py-10 [&_svg]:text-teal-200 [&_p]:text-stone-300"
            />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-10">
            <ErrorState message={error} onRetry={onRetry} />
          </div>
        ) : null}

        {!loading && !error && categories.length === 0 ? (
          <p className="mt-14 text-center text-sm text-stone-400">Chưa có danh mục gốc — thêm danh mục từ hệ thống quản trị để hiển thị tại đây.</p>
        ) : null}

        {!loading && !error && categories.length > 0 ? (
          <div className="mx-auto mt-14 flex max-w-4xl flex-wrap justify-center gap-3 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?categoryId=${c.id}`}
                className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-white/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-md transition duration-300 hover:border-teal-300/35 hover:bg-white/[0.14] hover:text-white md:px-7 md:py-3 md:text-[15px]"
              >
                <span className="relative z-10">{c.name}</span>
                <span
                  className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(120deg, transparent 30%, rgba(45,212,191,0.12) 50%, transparent 70%)",
                  }}
                  aria-hidden
                />
              </Link>
            ))}
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-teal-100/90 transition hover:border-teal-200/50 hover:text-white md:px-6 md:py-3"
            >
              Tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
