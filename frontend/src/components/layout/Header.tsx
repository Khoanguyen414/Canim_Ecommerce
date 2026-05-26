import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  Package,
  Warehouse,
  X,
  IdCard,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { useAuthModalStore } from "@/store/auth-modal.store"
import { clearPendingAuthRedirect } from "@/lib/authRedirect"
import { useCartStore } from "@/store/cart.store"
import { useWishlistStore } from "@/store/wishlist.store"
import { hasAppRole } from "@/lib/roles"
import { formatVnd } from "@/lib/format"
import { cn } from "@/lib/cn"
import { HeaderDesktopIvy } from "@/components/layout/HeaderDesktopIvy"
import { HeaderNavMenu } from "@/components/layout/HeaderNavMenu"
import { ShopLogoLink } from "@/components/layout/ShopLogoLink"

export default function Header() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const accountWrapRef = useRef<HTMLDivElement>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const openAuthModal = useAuthModalStore((s) => s.openModal)
  const closeAuthModal = useAuthModalStore((s) => s.closeModal)
  const cartCount = useCartStore((s) => s.totalItems())
  const cartTotal = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.price * l.quantity, 0))
  const wishlistCount = useWishlistStore((s) => s.count())

  const displayName = user ? (user.fullName?.trim() || user.email.split("@")[0] || user.email) : ""

  const profileInitial = user
    ? (user.fullName?.trim()?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()
    : ""

  const handleLogout = async () => {
    closeAuthModal()
    clearPendingAuthRedirect()
    localStorage.removeItem("authRememberEmail")
    setMobileOpen(false)
    setAccountMenuOpen(false)
    try {
      await logout()
    } finally {
      window.location.replace("/")
    }
  }

  useEffect(() => {
    if (!accountMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [accountMenuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    navigate(params.toString() ? `/products?${params.toString()}` : "/products")
    setMobileOpen(false)
  }

  const wishlistBtn = (
    <button
      type="button"
      onClick={() => navigate("/favorites")}
      className="relative p-2 text-[#d59a62] transition-colors hover:text-[#bf7f49]"
      aria-label="Sản phẩm yêu thích"
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] shrink-0 lg:h-5 lg:w-5 stroke-[1.5]",
          wishlistCount > 0 && "fill-primary/20",
        )}
      />
      <span className="sr-only">Yêu thích</span>
      {wishlistCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      ) : null}
    </button>
  )

  const cartBtn = (
    <button
      type="button"
      onClick={() => navigate("/cart")}
      className="relative p-2 text-[#d59a62] transition-colors hover:text-[#bf7f49]"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-[18px] w-[18px] shrink-0 lg:h-5 lg:w-5" />
      <span className="sr-only">Giỏ hàng</span>
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </button>
  )

  const mobileTools = (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {wishlistBtn}
      {cartBtn}
      <button
        type="button"
        onClick={() => {
          if (user) navigate("/account")
          else openAuthModal("login")
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[#d59a62] transition-colors hover:text-[#bf7f49]"
        aria-label={user ? "Hồ sơ tài khoản" : "Sign in"}
      >
        <User className="h-[18px] w-[18px] shrink-0" />
        <span className="text-xs font-semibold text-[#c98f5a]">Tài khoản</span>
      </button>
    </div>
  )

  const accountMenuDesktop = (
    <div ref={accountWrapRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setAccountMenuOpen((v) => !v)}
        className="p-2 text-[#d59a62] transition-colors hover:text-[#bf7f49]"
        aria-expanded={accountMenuOpen}
        aria-haspopup="true"
      >
        <User className="h-5 w-5 stroke-[1.5]" />
        <span className="sr-only">Tài khoản</span>
      </button>
      {accountMenuOpen ? (
        <div
          className="absolute right-0 z-[60] mt-1.5 w-72 overflow-hidden rounded-xl bg-white py-1 shadow-lg"
          role="menu"
        >
          {user ? (
            <>
              <div className="bg-gradient-to-br from-stone-50 to-primary/[0.06] px-4 py-4">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
                    {profileInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-[#253d4e]">{user.fullName?.trim() || displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-600">{user.email}</p>
                    {user.phone?.trim() ? (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.phone}</p>
                    ) : null}
                    <div className="mt-2 flex max-h-14 flex-wrap gap-1 overflow-hidden">
                      {user.roles?.map((r) => (
                        <span
                          key={r}
                          className="rounded-md border border-primary/20 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to="/account"
                  role="menuitem"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm transition hover:bg-primary/5"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <IdCard className="h-3.5 w-3.5" />
                  Trang hồ sơ đầy đủ
                </Link>
              </div>
              <Link
                to="/orders"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#253d4e] hover:bg-gray-50"
                onClick={() => setAccountMenuOpen(false)}
              >
                <Package className="h-4 w-4 text-primary" />
                Orders
              </Link>
              {hasAppRole(user.roles, ["ADMIN", "WAREHOUSE"]) ? (
                <Link
                  to="/warehouse"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#253d4e] hover:bg-gray-50"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <Warehouse className="h-4 w-4 text-primary" />
                  Warehouse
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => void handleLogout()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2.5 text-left text-sm font-medium text-[#253d4e] hover:bg-gray-50"
                onClick={() => {
                  setAccountMenuOpen(false)
                  openAuthModal("login")
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-gray-50"
                onClick={() => {
                  setAccountMenuOpen(false)
                  openAuthModal("register")
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  )

  const searchBlock = () => {
    return (
      <form
        onSubmit={submitSearch}
        className="flex h-9 w-full items-center overflow-hidden rounded-full border border-[#e8e3df] bg-[#f7f4f2] shadow-sm lg:h-10"
      >
        <input
          type="search"
          name="q"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="TÌM KIẾM SẢN PHẨM"
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-xs text-gray-800 outline-none placeholder:text-xs placeholder:font-medium placeholder:tracking-wide placeholder:text-gray-400 lg:text-[13px]"
          autoComplete="off"
          aria-label="Search"
        />
        <button
          type="submit"
          className="mr-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 lg:h-8 lg:w-8"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </form>
    )
  }

  const mobileNavExtras = (
    <>
      {user ? (
        <Link
          to="/account"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#253d4e] hover:bg-gray-50"
          onClick={() => setMobileOpen(false)}
        >
          <IdCard className="h-4 w-4 text-primary" />
          Hồ sơ
        </Link>
      ) : null}
      {user ? (
        <Link
          to="/orders"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#253d4e] hover:bg-gray-50"
          onClick={() => setMobileOpen(false)}
        >
          <Package className="h-4 w-4" />
          Orders
        </Link>
      ) : null}
      {user && hasAppRole(user.roles, ["ADMIN", "WAREHOUSE"]) ? (
        <Link
          to="/warehouse"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#253d4e] hover:bg-gray-50"
          onClick={() => setMobileOpen(false)}
        >
          <Warehouse className="h-4 w-4" />
          Warehouse
        </Link>
      ) : null}
    </>
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-white/95 backdrop-blur-xl",
        scrolled && "border-border/70 shadow-md shadow-black/[0.04]",
      )}
    >
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-0.5 text-center text-[10px] font-medium leading-tight text-[#7a4b24] sm:py-1 sm:text-xs">
          Free shipping cho đơn từ 499.000đ · Đổi trả trong 30 ngày
        </div>
      </div>
      <div className="container px-4 py-2 lg:py-3">
        <HeaderDesktopIvy
          pathname={pathname}
          search={search}
          searchBlock={searchBlock()}
          accountMenu={accountMenuDesktop}
          wishlistBtn={wishlistBtn}
          cartBtn={cartBtn}
          onNavClick={() => setMobileOpen(false)}
        />

        <div className="flex items-center justify-between gap-4 lg:hidden">
          <ShopLogoLink className="min-w-0" onNavigate={() => setMobileOpen(false)} />
          <button
            type="button"
            className="rounded-md p-2 text-[#d59a62] hover:text-[#bf7f49]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 lg:hidden">
          <div className="min-w-0 flex-1">{searchBlock()}</div>
          {mobileTools}
        </div>
      </div>

      {mobileOpen ? (
        <div className="bg-white lg:hidden">
          <div className="container px-4 py-4">
            <HeaderNavMenu
              pathname={pathname}
              search={search}
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
            <nav className="mt-3 flex flex-col gap-1 border-t border-border/60 pt-3">
            {mobileNavExtras}
            {user ? (
              <Button variant="outline" className="mt-2 w-full" type="button" onClick={() => void handleLogout()}>
                Sign out
              </Button>
            ) : (
              <div className="mt-3 flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  type="button"
                  onClick={() => {
                    openAuthModal("login")
                    setMobileOpen(false)
                  }}
                >
                  Sign in
                </Button>
                <Button
                  className="flex-1 bg-primary"
                  type="button"
                  onClick={() => {
                    openAuthModal("register")
                    setMobileOpen(false)
                  }}
                >
                  Register
                </Button>
              </div>
            )}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
