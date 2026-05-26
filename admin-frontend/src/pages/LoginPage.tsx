import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/http"
import { getApiErrorMessage } from "@/lib/apiError"
import type { ApiResponse } from "@/types/api"

type RegisterPayload = {
  email: string
  password: string
  fullName: string
  phone?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const [tab, setTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [regLoading, setRegLoading] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [regForm, setRegForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBanner(null)
    try {
      await login(email.trim(), password)
      navigate("/", { replace: true })
    } catch (err) {
      const message = getApiErrorMessage(err, "Đăng nhập thất bại")
      setError(message)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBanner(null)

    if (regForm.password !== regForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    setRegLoading(true)
    try {
      const payload: RegisterPayload = {
        email: regForm.email.trim(),
        password: regForm.password,
        fullName: regForm.fullName.trim(),
      }
      if (regForm.phone.trim()) payload.phone = regForm.phone.trim()

      const { data } = await api.post<ApiResponse<unknown>>("/auth/register", payload)
      if (!data.success) throw new Error(data.message ?? "Đăng ký thất bại")

      setBanner("Đăng ký thành công. Vui lòng đăng nhập — tài khoản cần được gán role ADMIN để vào trang quản trị.")
      setEmail(regForm.email.trim())
      setPassword("")
      setTab("login")
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng ký thất bại"))
    } finally {
      setRegLoading(false)
    }
  }

  const inputWithIconClass = "auth-input auth-input-with-icon"

  return (
    <div className="auth-screen">
      <div className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand-badge">ADMIN</div>
          <h1>Canim</h1>
          <p>Control Center</p>
          <span className="auth-brand-copy">Quản trị catalog, kho, vai trò và người dùng từ một bảng điều khiển duy nhất.</span>
        </aside>

        <section className="auth-panel">
          <div className="auth-tabs">
            <button
              type="button"
              className={tab === "login" ? "active" : ""}
              onClick={() => {
                setTab("login")
                setError(null)
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={tab === "register" ? "active" : ""}
              onClick={() => {
                setTab("register")
                setError(null)
              }}
            >
              Đăng ký
            </button>
          </div>

          {banner ? <div className="banner-box">{banner}</div> : null}
          {error ? (
            <div className="error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          {tab === "login" ? (
            <form className="auth-form" onSubmit={onSubmit}>
              <label>
                Email
                <span className="field-wrap">
                  <Mail size={16} />
                  <input
                    className={inputWithIconClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </span>
              </label>
              <label>
                Mật khẩu
                <span className="field-wrap field-wrap-password">
                  <Lock size={16} />
                  <input
                    className={inputWithIconClass}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-btn" disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng nhập admin"
                )}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Họ và tên
                <span className="field-wrap">
                  <User size={16} />
                  <input
                    className={inputWithIconClass}
                    value={regForm.fullName}
                    onChange={(e) => setRegForm((f) => ({ ...f, fullName: e.target.value }))}
                    required
                  />
                </span>
              </label>
              <label>
                Email
                <span className="field-wrap">
                  <Mail size={16} />
                  <input
                    className={inputWithIconClass}
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </span>
              </label>
              <label>
                Số điện thoại
                <span className="field-wrap">
                  <Phone size={16} />
                  <input
                    className={inputWithIconClass}
                    value={regForm.phone}
                    onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </span>
              </label>
              <label>
                Mật khẩu
                <span className="field-wrap field-wrap-password">
                  <Lock size={16} />
                  <input
                    className={inputWithIconClass}
                    type={showRegPassword ? "text" : "password"}
                    value={regForm.password}
                    onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowRegPassword((v) => !v)}>
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <label>
                Xác nhận mật khẩu
                <span className="field-wrap field-wrap-password">
                  <Lock size={16} />
                  <input
                    className={inputWithIconClass}
                    type={showRegConfirm ? "text" : "password"}
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowRegConfirm((v) => !v)}>
                    {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-btn" disabled={regLoading} type="submit">
                {regLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
