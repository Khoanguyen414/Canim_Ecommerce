import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminTopbar } from "@/components/layout/AdminTopbar"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrap">
        <AdminTopbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
