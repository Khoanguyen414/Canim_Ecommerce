import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/auth"

export function ProtectedRoute() {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)

  if (!initialized) {
    return (
      <div className="center-screen">
        <div className="spinner spinner-lg" />
        <span>Đang tải phiên admin...</span>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
