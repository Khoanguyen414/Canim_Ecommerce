import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react"
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa"
import { useAuthStore } from "@/store/auth.store"
import { useAuthModalStore } from "@/store/auth-modal.store"
import { authService } from "@/services/auth.service"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { getApiErrorMessage } from "@/lib/apiError"
import { consumePostAuthRedirect } from "@/lib/authRedirect"
import canimLogo from "@/assets/brand/canim-logo.png"
import { useCleanedLogo } from "@/hooks/useCleanedLogo"
import { cn } from "@/lib/cn"

const INPUT_WRAP =
  "relative flex h-12 w-full items-center rounded-2xl border border-stone-200/90 bg-white px-4 transition focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10"
const INPUT_FIELD =
  "min-w-0 flex-1 border-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
const ICON_CLASS = "mr-3 h-4 w-4 shrink-0 text-[#c89b5a]"

function SocialButton({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-md ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {children}
    </button>
  )
}

function SocialRow() {
  return (
    <div className="flex items-center justify-center gap-5">
      <SocialButton label="Facebook">
        <FaFacebookF className="text-[#1877F2]" />
      </SocialButton>
      <SocialButton label="Google">
        <FaGoogle className="text-[#DB4437]" />
      </SocialButton>
      <SocialButton label="Apple">
        <FaApple className="text-stone-900" />
      </SocialButton>
    </div>
  )
}

/** Đường gold decorative ở chân modal. */
function GoldDeco() {
  return (
    <div className="pointer-events-none mt-5 flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 240 24" className="h-4 w-40 text-[#c89b5a]" fill="none" aria-hidden>
        <path d="M0 14 Q60 -6 120 14 Q180 30 240 6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="h-px w-24 bg-gradient-to-r from-transparent via-[#c89b5a]/60 to-transparent" />
    </div>
  )
}

export default function AuthModal() {
  const navigate = useNavigate()
  const open = useAuthModalStore((s) => s.open)
  const tab = useAuthModalStore((s) => s.tab)
  const openModal = useAuthModalStore((s) => s.openModal)
  const closeModal = useAuthModalStore((s) => s.closeModal)
  const login = useAuthStore((s) => s.login)
  const loginWithAuthResult = useAuthStore((s) => s.loginWithAuthResult)
  const cleanedLogo = useCleanedLogo(canimLogo)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginBanner, setLoginBanner] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState("")

  const [regForm, setRegForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  })
  const [showRegPw, setShowRegPw] = useState(false)
  const [showRegPw2, setShowRegPw2] = useState(false)
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [agree, setAgree] = useState(false)

  useEffect(() => {
    if (!open) {
      setLoginError("")
      setLoginBanner("")
      setRegError("")
      setLoginLoading(false)
      setRegLoading(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeModal])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginBanner("")
    setLoginLoading(true)
    try {
      await login(loginEmail, loginPassword)
      closeModal()
      const to = consumePostAuthRedirect()
      if (to && to !== "/") navigate(to, { replace: true })
    } catch (err) {
      setLoginError(getApiErrorMessage(err, "Email hoặc mật khẩu không đúng"))
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")
    if (!agree) {
      setRegError("Bạn cần đồng ý với điều khoản sử dụng và chính sách bảo mật.")
      return
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Mật khẩu xác nhận không khớp")
      return
    }
    setRegLoading(true)
    try {
      const { data } = await authService.register({
        email: regForm.email,
        fullName: regForm.fullName,
        password: regForm.password,
        phone: regForm.phone || undefined,
      })
      if (!data.success) throw new Error(data.message || "Đăng ký thất bại")
      setLoginBanner("Đăng ký xong — đăng nhập bên dưới.")
      setLoginEmail(regForm.email)
      setLoginPassword("")
      setRegForm((f) => ({ ...f, password: "", confirmPassword: "" }))
      openModal("login")
    } catch (err) {
      setRegError(getApiErrorMessage(err))
    } finally {
      setRegLoading(false)
    }
  }

  const isLogin = tab === "login"
  const heading = isLogin ? "Chào mừng bạn trở lại!" : "Tạo tài khoản mới"
  const subheading = isLogin
    ? "Đăng nhập để tiếp tục trải nghiệm thời trang đẳng cấp."
    : "Tham gia cùng chúng tôi và khám phá phong cách của bạn."
  const submitLabel = isLogin ? "Đăng nhập" : "Đăng ký"
  const dividerLabel = isLogin ? "hoặc đăng nhập với" : "hoặc đăng ký với"

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-stone-950/55 px-3 py-6 backdrop-blur-sm sm:px-6"
      role="presentation"
      onClick={() => closeModal()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-heading"
        className="relative my-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#f5efe8_0%,#fbf4eb_45%,#fff3e2_100%)] shadow-2xl ring-1 ring-stone-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bokeh decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-[#e8d4b8]/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 top-1/3 h-52 w-52 rounded-full bg-[#d2b48c]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-full bg-[#c89b5a]/20 blur-3xl"
        />

        {/* CLOSE */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            closeModal()
          }}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm ring-1 ring-stone-200/80 backdrop-blur transition hover:bg-white hover:text-stone-900"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
          {/* LOGO */}
          <div className="flex items-center justify-center">
            <img
              src={cleanedLogo ?? canimLogo}
              alt="Canim"
              draggable={false}
              className="h-28 w-auto max-w-[min(320px,90vw)] select-none object-contain drop-shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:h-32"
            />
          </div>

          {/* CARD */}
          <div className="mt-4 w-full rounded-[1.75rem] bg-white/95 px-5 py-6 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.25)] ring-1 ring-white/70 backdrop-blur-sm sm:px-6 sm:py-7">
          <h2
            id="auth-modal-heading"
            className="text-center text-[26px] font-bold leading-tight text-stone-900 sm:text-[28px]"
          >
            {heading}
          </h2>
          <p className="mt-1.5 text-center text-sm text-stone-500">{subheading}</p>

          {loginBanner && isLogin ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
              {loginBanner}
            </div>
          ) : null}
          {isLogin && loginError ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          ) : null}
          {!isLogin && regError ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{regError}</span>
            </div>
          ) : null}

          {isLogin ? (
            <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
              <label className={INPUT_WRAP}>
                <User className={ICON_CLASS} />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email hoặc số điện thoại"
                  className={INPUT_FIELD}
                  required
                  autoComplete="username"
                />
              </label>

              <label className={INPUT_WRAP}>
                <Lock className={ICON_CLASS} />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className={INPUT_FIELD}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  className="ml-2 text-stone-400 hover:text-stone-700"
                  aria-label={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showLoginPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-[#c89b5a] hover:underline"
                  onClick={() => {
                    closeModal()
                    navigate("/forgot-password")
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 text-sm font-semibold tracking-wide text-white shadow-lg shadow-stone-900/30 transition hover:bg-stone-800 disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý…
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-3">
              <label className={INPUT_WRAP}>
                <User className={ICON_CLASS} />
                <input
                  value={regForm.fullName}
                  onChange={(e) => setRegForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Họ và tên"
                  className={INPUT_FIELD}
                  required
                  autoComplete="name"
                />
              </label>
              <label className={INPUT_WRAP}>
                <Mail className={ICON_CLASS} />
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  className={INPUT_FIELD}
                  required
                  autoComplete="email"
                />
              </label>
              <label className={INPUT_WRAP}>
                <Phone className={ICON_CLASS} />
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Số điện thoại"
                  className={INPUT_FIELD}
                  autoComplete="tel"
                />
              </label>
              <label className={INPUT_WRAP}>
                <Lock className={ICON_CLASS} />
                <input
                  type={showRegPw ? "text" : "password"}
                  value={regForm.password}
                  onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mật khẩu"
                  className={INPUT_FIELD}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPw((v) => !v)}
                  className="ml-2 text-stone-400 hover:text-stone-700"
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showRegPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </label>
              <label className={INPUT_WRAP}>
                <Lock className={ICON_CLASS} />
                <input
                  type={showRegPw2 ? "text" : "password"}
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Xác nhận mật khẩu"
                  className={INPUT_FIELD}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPw2((v) => !v)}
                  className="ml-2 text-stone-400 hover:text-stone-700"
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showRegPw2 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </label>

              <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs text-stone-600">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                    agree
                      ? "border-[#c89b5a] bg-[#c89b5a] text-white"
                      : "border-stone-300 bg-white",
                  )}
                >
                  {agree ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="/about" className="font-medium text-[#c89b5a] hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="/about" className="font-medium text-[#c89b5a] hover:underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={regLoading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 text-sm font-semibold tracking-wide text-white shadow-lg shadow-stone-900/30 transition hover:bg-stone-800 disabled:opacity-60"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý…
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wider text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            <span>{dividerLabel}</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="mt-5 space-y-3">
            {googleError ? (
              <p className="text-center text-xs text-red-600">{googleError}</p>
            ) : null}
            <GoogleSignInButton
              disabled={googleLoading || loginLoading}
              onCredential={async (idToken) => {
                setGoogleError("")
                setGoogleLoading(true)
                try {
                  const { data } = await authService.googleLogin(idToken)
                  if (!data.success || !data.result) {
                    throw new Error(data.message || "Google login failed")
                  }
                  await loginWithAuthResult(data.result)
                  closeModal()
                  const to = consumePostAuthRedirect()
                  if (to && to !== "/") navigate(to, { replace: true })
                } catch (err) {
                  setGoogleError(getApiErrorMessage(err, "Đăng nhập Google thất bại"))
                } finally {
                  setGoogleLoading(false)
                }
              }}
              onError={setGoogleError}
            />
            <SocialRow />
          </div>

          <p className="mt-6 text-center text-sm text-stone-700">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <button
              type="button"
              onClick={() => openModal(isLogin ? "register" : "login")}
              className="font-semibold text-[#c89b5a] hover:underline"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
            </button>
          </p>
          </div>

          <GoldDeco />
        </div>
      </div>
    </div>
  )
}
