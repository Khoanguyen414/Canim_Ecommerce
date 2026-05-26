import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/cn"

const SLIDE_MS = 10_000

type Slide = {
  id: string
  kicker: string
  title: string
  subtitle: string
  image: string
  cta: { label: string; to: string }
}

const SLIDES: Slide[] = [
  {
    id: "fashion",
    kicker: "Thời trang",
    title: "Quần áo & phong cách mới mỗi tuần",
    subtitle: "Casual, công sở và streetwear — chọn outfit phù hợp cả ngày dài.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=82",
    cta: { label: "Xem bộ sưu tập", to: "/products" },
  },
  {
    id: "home",
    kicker: "Gia dụng",
    title: "Đồ dùng nhà cửa gọn gàng, đẹp mắt",
    subtitle: "Bếp, phòng khách, phòng tắm — tiện ích hằng ngày cho tổ ấm của bạn.",
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1800&q=82",
    cta: { label: "Khám phá", to: "/products" },
  },
  {
    id: "accessories",
    kicker: "Phụ kiện",
    title: "Túi, đồng hồ & chi tiết hoàn thiện set đồ",
    subtitle: "Mix & match phụ kiện để nâng tầm phong cách — phù hợp đi làm và đi chơi.",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1800&q=82",
    cta: { label: "Mua phụ kiện", to: "/products" },
  },
  {
    id: "shop",
    kicker: "Mua sắm online",
    title: "Đặt hàng dễ dàng — giao tận tay",
    subtitle: "Lướt lookbook, chọn size và nhận hàng nhanh chóng, an tâm khi đổi trả.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=82",
    cta: { label: "Mua ngay", to: "/products" },
  },
]

export function HomeNestHero() {
  const [active, setActive] = useState(0)
  const [motionOk, setMotionOk] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setMotionOk(!mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!motionOk) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [motionOk])

  const goTo = useCallback((i: number) => {
    setActive(i)
  }, [])

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  const next = useCallback(() => {
    setActive((i) => (i + 1) % SLIDES.length)
  }, [])

  return (
    <section className="container px-4 pb-2 pt-3 md:pt-4" aria-roledescription="carousel" aria-label="Ưu đãi và chương trình nổi bật">
      <div
        className="group relative h-[clamp(320px,48vw,560px)] min-h-[320px] w-full overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] bg-neutral-900 shadow-sm sm:min-h-[380px] md:min-h-[420px]"
        aria-label="Banner chính"
      >
        {SLIDES.map((s, i) => {
          const on = i === active
          return (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                on ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
              aria-hidden={!on}
            >
              <img
                src={s.image}
                alt=""
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                className="h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-0 z-[2] flex flex-col justify-center px-6 py-8 md:px-12 md:py-10 lg:px-16"
                lang="vi"
              >
                <div className="max-w-xl md:max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary md:text-sm">
                    {s.kicker}
                  </p>
                  <h2 className="mt-3 text-balance font-sans text-3xl font-bold leading-[1.15] tracking-normal text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                    {s.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 md:text-base md:leading-relaxed">
                    {s.subtitle}
                  </p>
                  <Link
                    to={s.cta.to}
                    className="mt-6 inline-flex w-fit items-center rounded-md bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 md:px-8 md:py-3.5 md:text-base"
                  >
                    {s.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/80 transition hover:text-white md:left-4 md:h-10 md:w-10"
          aria-label="Slide trước"
        >
          <ChevronLeft className="h-7 w-7 stroke-[1.25]" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/80 transition hover:text-white md:right-4 md:h-10 md:w-10"
          aria-label="Slide sau"
        >
          <ChevronRight className="h-7 w-7 stroke-[1.25]" />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-[3] flex justify-center gap-1.5 pb-3 md:pb-4">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75",
              )}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
