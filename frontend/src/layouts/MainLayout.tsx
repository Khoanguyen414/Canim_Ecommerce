import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"

export default function MainLayout() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
