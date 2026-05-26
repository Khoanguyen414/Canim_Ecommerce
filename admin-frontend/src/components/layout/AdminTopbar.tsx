import { Bell, LogOut, Menu, Search, Store } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? "http://localhost:5173"

type Props = {
  onMenuToggle: () => void
}

export function AdminTopbar({ onMenuToggle }: Props) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const initials = (user?.fullName || user?.email || "C").slice(0, 1).toUpperCase()
  const displayName = user?.fullName ?? "Admin Canim"

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="btn-icon-menu" onClick={onMenuToggle} aria-label="Mở menu">
          <Menu size={20} />
        </button>
        <p className="topbar-greeting">
          Xin chào, <strong>{displayName}</strong> <span aria-hidden>👋</span>
        </p>
      </div>

      <div className="topbar-search">
        <Search size={18} />
        <input type="search" placeholder="Tìm kiếm..." aria-label="Tìm kiếm" />
      </div>

      <div className="topbar-actions">
        <button type="button" className="topbar-notify" aria-label="Thông báo">
          <Bell size={20} />
          <span className="notify-dot">2</span>
        </button>

        <div className="topbar-profile">
          <span className="user-avatar gold">{initials}</span>
          <div className="topbar-profile-text">
            <strong>{displayName}</strong>
            <span>Quản trị viên</span>
          </div>
        </div>

        <a className="btn btn-ghost btn-sm" href={STOREFRONT_URL} target="_blank" rel="noreferrer">
          <Store size={15} />
          Cửa hàng
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            logout()
            navigate("/login", { replace: true })
          }}
        >
          <LogOut size={15} />
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
