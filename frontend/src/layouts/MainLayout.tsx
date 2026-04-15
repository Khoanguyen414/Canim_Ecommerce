import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { cn } from "@/utils/cn"

export default function MainLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={cn("flex min-h-screen flex-col", !isHome && "bg-gray-50")}>
      <Header />
      <main className={cn("flex-1", isHome && "bg-transparent")}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
