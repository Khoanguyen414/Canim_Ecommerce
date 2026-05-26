import type { ReactNode } from "react"
import { useAuthStore } from "@/store/auth.store"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { RequireAuthOpenModal } from "./RequireAuthOpenModal"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) {
    return <LoadingSpinner label="Đang tải phiên đăng nhập..." />
  }

  if (!user) {
    return <RequireAuthOpenModal />
  }

  return <>{children}</>
}
