import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/utils/cn"

const AUTO_MS = 5000

type HeroSlide = {
  id: string
  badge: string
  title: string
  description: string
}

const SLIDES: HeroSlide[] = [
  {
    id: "bags",
    badge: "Welcome to Canim ecommerce",
    title: "Discover high-quality products",
    description:
      "Real inventory, prices based on product variants, secure payment, and fast support — powered by your backend API.",
  },
  {
    id: "delivery",
    badge: "Fast & reliable",
    title: "From warehouse to your door",
    description:
      "Track stock in real time, pick the variant that fits you, and checkout with confidence on every order.",
  },
  {
    id: "trust",
    badge: "Shop with peace of mind",
    title: "Secure payments & clear pricing",
    description:
      "Variant-level pricing, transparent availability, and a storefront built to showcase what your API delivers.",
  },
]

function VisualShoppingBags() {
  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full max-w-md drop-shadow-xl" aria-hidden>
      <defs>
        <linearGradient id="hero-bag-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="hero-bag-orange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <path
        d="M55 95 L55 210 Q55 230 75 230 L155 230 Q175 230 175 210 L175 120 Q175 95 150 95 L80 95 Q55 95 55 95 Z"
        fill="url(#hero-bag-blue)"
        opacity="0.95"
      />
      <path
        d="M95 95 L95 75 Q95 55 115 55 L125 55 Q145 55 145 75 L145 95"
        fill="none"
        stroke="#0c4a6e"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M165 75 L165 195 Q165 218 188 218 L285 218 Q308 218 308 195 L308 100 Q308 75 280 75 L195 75 Q165 75 165 75 Z"
        fill="url(#hero-bag-orange)"
        opacity="0.98"
      />
      <path
        d="M228 75 L228 58 Q228 42 248 42 L262 42 Q282 42 282 58 L282 75"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <ellipse cx="115" cy="200" rx="28" ry="8" fill="black" opacity="0.15" />
      <ellipse cx="248" cy="200" rx="32" ry="9" fill="black" opacity="0.18" />
    </svg>
  )
}

function VisualDeliveryBox() {
  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full max-w-md drop-shadow-xl" aria-hidden>
      <defs>
        <linearGradient id="hero-box-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="hero-box-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="hero-box-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path d="M180 40 L300 100 L180 155 L60 100 Z" fill="url(#hero-box-top)" opacity="0.95" />
      <path d="M60 100 L60 195 L180 250 L180 155 Z" fill="url(#hero-box-side)" opacity="0.92" />
      <path d="M180 155 L180 250 L300 195 L300 100 Z" fill="url(#hero-box-front)" opacity="0.95" />
      <path d="M180 40 L180 155" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
      <path d="M120 128 L240 128" stroke="rgba(0,0,0,0.15)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="210" cy="175" r="18" fill="#0f766e" opacity="0.9" />
      <path d="M202 175 L208 182 L222 166" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="180" cy="248" rx="90" ry="10" fill="black" opacity="0.12" />
    </svg>
  )
}

function VisualSecureTrust() {
  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full max-w-md drop-shadow-xl" aria-hidden>
      <defs>
        <linearGradient id="hero-shield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="hero-lock" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <path
        d="M180 35 C120 55 75 95 75 155 L75 175 C75 215 120 250 180 250 C240 250 285 215 285 175 L285 155 C285 95 240 55 180 35 Z"
        fill="url(#hero-shield)"
        opacity="0.95"
      />
      <path
        d="M180 55 C135 72 100 105 100 155 L100 172 C100 205 135 232 180 232 C225 232 260 205 260 172 L260 155 C260 105 225 72 180 55 Z"
        fill="rgba(0,0,0,0.12)"
      />
      <rect x="145" y="115" width="70" height="55" rx="10" fill="url(#hero-lock)" opacity="0.95" />
      <path
        d="M155 115 L155 100 C155 82 166 72 180 72 C194 72 205 82 205 100 L205 115"
        fill="none"
        stroke="#064e3b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="180" cy="145" r="8" fill="#065f46" />
      <path d="M168 158 L176 168 L194 148" fill="none" stroke="#ecfdf5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="180" cy="248" rx="72" ry="9" fill="black" opacity="0.14" />
    </svg>
  )
}

const VISUALS = [VisualShoppingBags, VisualDeliveryBox, VisualSecureTrust] as const

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [tabHidden, setTabHidden] = useState(typeof document !== "undefined" ? document.hidden : false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const go = useCallback((dir: -1 | 1) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  useEffect(() => {
    if (tabHidden) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [tabHidden])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  const t = reduceMotion ? "duration-0" : "duration-700 ease-in-out"

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-[#0a3d38] to-[#062922] pb-20 pt-8 text-white md:pb-28 md:pt-12"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-teal-500/40 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-emerald-600/30 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative min-h-[340px] md:min-h-[300px] lg:min-h-[280px]">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  "flex flex-col justify-center transition-all will-change-transform",
                  t,
                  i === index
                    ? "relative z-10 translate-x-0 opacity-100"
                    : "pointer-events-none absolute inset-0 z-0 translate-x-4 opacity-0",
                )}
                aria-hidden={i !== index}
              >
                <span className="mb-4 inline-block w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-teal-100 backdrop-blur-sm">
                  {slide.badge}
                </span>
                <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-teal-100/85 md:text-xl">{slide.description}</p>
                <div className="mt-8 flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap">
                  <Link
                    to="/products"
                    className="inline-flex transform items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:scale-[1.02] hover:shadow-orange-500/40 md:px-10 md:py-4"
                  >
                    Explore now
                  </Link>
                  <Link
                    to="/categories"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-transparent px-8 py-3.5 text-center text-base font-semibold text-white transition hover:bg-white/10 md:px-10 md:py-4"
                  >
                    View categories
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-8 shadow-2xl backdrop-blur-md md:min-h-[340px] md:p-10">
              {VISUALS.map((Visual, i) => (
                <div
                  key={SLIDES[i].id}
                  className={cn(
                    "flex w-full items-center justify-center transition-all will-change-transform",
                    t,
                    i === index
                      ? "relative z-10 translate-x-0 scale-100 opacity-100"
                      : "pointer-events-none absolute inset-0 z-0 translate-x-8 scale-[0.94] opacity-0",
                  )}
                  aria-hidden={i !== index}
                >
                  <Visual />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-white/15"
                style={!reduceMotion ? { ["--hero-ms" as string]: `${AUTO_MS}ms` } : undefined}
                aria-hidden
              >
                {!reduceMotion ? (
                  <div
                    key={index}
                    className="hero-carousel-progress-fill h-full rounded-full bg-gradient-to-r from-teal-200/90 to-white/75"
                  />
                ) : (
                  <div className="h-full w-[35%] rounded-full bg-white/35" />
                )}
              </div>
              <div className="flex items-center justify-center gap-3 sm:justify-end">
                <button
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Previous slide"
                  onClick={() => go(-1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      aria-current={i === index}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === index ? "w-8 bg-white" : "w-2 bg-white/35 hover:bg-white/55",
                      )}
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Next slide"
                  onClick={() => go(1)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
