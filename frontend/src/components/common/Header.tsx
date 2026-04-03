import { Heart, ShoppingCart, User, Menu, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"

export default function Header() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            CanimShop
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link
            to="/products"
            className="text-sm hover:text-primary transition-colors"
          >
            Sản phẩm
          </Link>
          <Link
            to="/categories"
            className="text-sm hover:text-primary transition-colors"
          >
            Danh mục
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search (desktop only) */}
          <div className="hidden lg:flex items-center bg-secondary px-3 py-2 rounded-md">
            <input
              type="search"
              placeholder="Tìm kiếm..."
              className="bg-transparent outline-none text-sm w-32"
            />
          </div>

          {/* Icons */}
          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                <User className="w-5 h-5" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden md:flex"
              >
                Đăng nhập
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="hidden md:flex"
              >
                Đăng ký
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container flex flex-col gap-4 py-4">
            <Link to="/" className="text-sm hover:text-primary">
              Trang chủ
            </Link>
            <Link to="/products" className="text-sm hover:text-primary">
              Sản phẩm
            </Link>
            <Link to="/categories" className="text-sm hover:text-primary">
              Danh mục
            </Link>
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Đăng ký
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
