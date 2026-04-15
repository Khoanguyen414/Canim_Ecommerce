import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAuthStore, type AuthUser } from "@/store/auth.store"

type AuthContextValue = {
  user: AuthUser | null
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <AuthContext.Provider value={{ user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
