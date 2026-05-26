import { useAuthModalStore } from "@/store/auth-modal.store"

export const POST_AUTH_REDIRECT_KEY = "postAuthRedirect"

export function openLoginModalWithReturnTo(path: string) {
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path)
  useAuthModalStore.getState().openModal("login")
}

export function consumePostAuthRedirect(): string | null {
  const v = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)
  if (v) sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY)
  return v
}

/** Gọi khi đăng xuất: bỏ URL “quay lại sau login” còn lưu. */
export function clearPendingAuthRedirect() {
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY)
}
