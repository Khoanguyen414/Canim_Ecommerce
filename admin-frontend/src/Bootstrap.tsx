import { useEffect } from "react"
import App from "./App"
import { useAuthStore } from "@/store/auth"

export function Bootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])
  return <App />
}
