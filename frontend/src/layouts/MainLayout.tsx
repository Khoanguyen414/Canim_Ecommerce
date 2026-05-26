import { useEffect, useState } from "react"
import { Outlet, useLocation, useSearchParams } from "react-router-dom"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AuthModal from "@/components/auth/AuthModal"
import WelcomePromoModal from "@/components/layout/WelcomePromoModal"
import { useAuthModalStore } from "@/store/auth-modal.store"

export default function MainLayout() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const authQ = searchParams.get("auth")
  const [promoOpen, setPromoOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (authQ !== "login" && authQ !== "register") return
    useAuthModalStore.getState().openModal(authQ === "register" ? "register" : "login")
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete("auth")
        return next
      },
      { replace: true },
    )
  }, [authQ, setSearchParams])

  useEffect(() => {
    const key = "canim_welcome_promo_seen"
    const hasSeen = window.sessionStorage.getItem(key) === "1"
    if (!hasSeen) {
      setPromoOpen(true)
      window.sessionStorage.setItem(key, "1")
    }
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-[#fffaf7]">
      <a
        href="#main-content"
        className="sr-only z-[120] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_50%,hsl(20_90%_92%/0.45),transparent_50%),linear-gradient(180deg,#fffaf7_0%,#fff3ec_100%)]"
        aria-hidden
      />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WelcomePromoModal open={promoOpen} onClose={() => setPromoOpen(false)} />
      <AuthModal />
    </div>
  )
}
