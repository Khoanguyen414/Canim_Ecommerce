import { useLayoutEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthModalStore } from "@/store/auth-modal.store"
import { POST_AUTH_REDIRECT_KEY } from "@/lib/authRedirect"

/** Điều hướng về trang chủ và mở modal đăng nhập; lưu URL hiện tại để đăng nhập xong quay lại. */
export function RequireAuthOpenModal() {
  const location = useLocation()
  const from = `${location.pathname}${location.search}`

  useLayoutEffect(() => {
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, from)
    useAuthModalStore.getState().openModal("login")
  }, [from])

  return <Navigate to="/" replace />
}
