import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  if (!initialized) {
    return <LoadingSpinner label="Đang tải phiên đăng nhập..." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
