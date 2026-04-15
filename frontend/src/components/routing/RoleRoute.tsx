import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { hasAppRole, type AppRole } from "@/lib/roles"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

export function RoleRoute({
  allow,
  children,
  fallbackTo = "/",
}: {
  allow: AppRole | AppRole[]
  children: ReactNode
  fallbackTo?: string
}) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) {
    return <LoadingSpinner label="Đang kiểm tra quyền..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasAppRole(user.roles, allow)) {
    return <Navigate to={fallbackTo} replace />
  }

  return <>{children}</>
}
