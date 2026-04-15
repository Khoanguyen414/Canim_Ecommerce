import {
  LayoutDashboard,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  Warehouse,
  X,
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"
import { hasAppRole } from "@/lib/roles"
import { cn } from "@/utils/cn"

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className={cn("h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5", className)}
      aria-hidden
    >
      <rect width="40" height="20" fill="#f97316" />
      <rect y="20" width="40" height="20" fill="#5eead4" />
      <path
        d="M20 34c-1-4-2-7-2-10 0-4 1.5-6 2-7 .5 1 2 3 2 7 0 3-1 6-2 10z"
        fill="#14532d"
        opacity="0.85"
      />
      <ellipse cx="20" cy="14" rx="6" ry="3" fill="#14532d" opacity="0.35" />
    </svg>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === "/"
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const cartCount = useCartStore((s) => s.totalItems())

  const handleLogout = async () => {
    await logout()
    navigate("/login")
    setMobileOpen(false)
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products")
    setMobileOpen(false)
  }

  const searchForm = (
    <form
      onSubmit={submitSearch}
      className={cn(
        "flex min-w-0 flex-1 items-center rounded-full border px-3 py-2 pl-4 shadow-inner md:max-w-xl lg:max-w-2xl",
        isHome
          ? "border-white/25 bg-white/10 backdrop-blur-md"
          : "border-gray-200 bg-white shadow-inner",
      )}
    >
      <input
        type="search"
        name="q"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for products, brands..."
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm outline-none",
          isHome ? "text-white placeholder:text-teal-200/70" : "text-gray-900 placeholder:text-gray-400",
        )}
        autoComplete="off"
        aria-label="Search"
      />
      <button
        type="submit"
        className={cn(
          "ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          isHome ? "text-teal-100 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
        )}
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  )

  const cartBtn = (
    <button
      type="button"
      onClick={() => navigate("/cart")}
      className={cn(
        "relative rounded-full p-2.5 transition-colors",
        isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100",
      )}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </button>
  )

  const userBtn = (
    <button
      type="button"
      onClick={() => navigate(user ? "/orders" : "/login")}
      className={cn(
        "rounded-full p-2.5 transition-colors",
        isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100",
      )}
      aria-label={user ? "Account" : "Sign in"}
    >
      <User className="h-6 w-6" />
    </button>
  )

  const authCluster =
    user ? (
      <>
        <span
          className={cn(
            "hidden max-w-[120px] truncate text-xs lg:block xl:max-w-[160px]",
            isHome ? "text-teal-100" : "text-gray-500",
          )}
          title={user.email}
        >
          {user.fullName || user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "hidden border-white/40 text-white hover:bg-white/10 lg:inline-flex",
            !isHome && "border-border text-foreground hover:bg-muted",
          )}
          type="button"
          onClick={() => void handleLogout()}
        >
          Sign out
        </Button>
      </>
    ) : (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className={cn(
            "hidden text-sm font-semibold transition-colors md:inline",
            isHome ? "text-white hover:text-teal-100" : "text-gray-700 hover:text-orange-600",
          )}
        >
          Sign in
        </button>
        <Button
          size="sm"
          type="button"
          className="hidden rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 font-semibold text-white shadow-md hover:from-red-600 hover:to-orange-600 md:inline-flex"
          onClick={() => navigate("/register")}
        >
          Register
        </Button>
      </div>
    )

  const logoBlock = (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 md:gap-3" onClick={() => setMobileOpen(false)}>
      <LogoMark className={isHome ? "ring-white/20" : undefined} />
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-lg font-bold lowercase tracking-tight",
            isHome ? "text-white" : "text-[#3d4f3a]",
          )}
        >
          canim
        </span>
        <span className={cn("text-[11px] font-medium md:text-xs", isHome ? "text-teal-200/90" : "text-gray-500")}>
          ecommerce
        </span>
      </div>
    </Link>
  )

  const navLinks = (
    <nav
      className={cn(
        "hidden items-center gap-5 text-sm font-semibold lg:flex",
        isHome ? "text-teal-100" : "text-gray-600",
      )}
    >
      <Link to="/" className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}>
        Home
      </Link>
      <Link to="/products" className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}>
        Shop
      </Link>
      <Link
        to="/categories"
        className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}
      >
        Categories
      </Link>
      {user ? (
        <Link to="/orders" className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}>
          Orders
        </Link>
      ) : null}
      {user && hasAppRole(user.roles, "ADMIN") ? (
        <Link to="/admin" className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}>
          Admin
        </Link>
      ) : null}
      {user && hasAppRole(user.roles, ["ADMIN", "WAREHOUSE"]) ? (
        <Link
          to="/warehouse"
          className={cn("transition-colors", isHome ? "hover:text-white" : "hover:text-orange-600")}
        >
          Warehouse
        </Link>
      ) : null}
    </nav>
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        isHome
          ? "border-b border-white/10 bg-gradient-to-r from-slate-950 via-[#0c4a42] to-teal-900 text-white shadow-lg shadow-black/20"
          : "bg-white shadow-sm",
      )}
    >
      {!isHome ? <div className="h-1 w-full bg-emerald-800" aria-hidden /> : null}

      {isHome ? (
        <div className="container px-4 py-4">
          {/* Mobile / tablet: brand on the left like a normal site; search below */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              {logoBlock}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {cartBtn}
                {userBtn}
                <div className="hidden items-center gap-2 sm:flex">{authCluster}</div>
                <button
                  type="button"
                  className="rounded-full p-2 text-white hover:bg-white/10"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Menu"
                >
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
            {searchForm}
            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3 sm:hidden">
              {authCluster}
            </div>
          </div>

          {/* Desktop: one bar — logo + nav | search | cart/auth (same mental model as other pages) */}
          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex min-w-0 shrink-0 items-center gap-6">
              {logoBlock}
              {navLinks}
            </div>
            <div className="min-w-0 flex-1">{searchForm}</div>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              {cartBtn}
              {userBtn}
              <div className="flex items-center gap-2">{authCluster}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container grid grid-cols-[1fr_auto] grid-rows-[auto_auto] gap-x-3 gap-y-3 px-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-rows-1 lg:items-center lg:gap-6 lg:py-3">
          <div className="order-1 flex min-w-0 items-center gap-4 lg:gap-6">
            {logoBlock}
            {navLinks}
          </div>
          <div className="order-3 col-span-2 min-w-0 lg:order-none lg:col-span-1">{searchForm}</div>
          <div className="order-2 flex shrink-0 items-center justify-end gap-0.5 sm:gap-1 lg:order-none lg:gap-2">
            {cartBtn}
            {userBtn}
            <div className="hidden items-center gap-2 lg:flex">{authCluster}</div>
            <button
              type="button"
              className="rounded-full p-2 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      )}

      {mobileOpen ? (
        <div
          className={cn(
            "border-t lg:hidden",
            isHome ? "border-white/10 bg-slate-950/95" : "border-gray-100 bg-white",
          )}
        >
          <nav className="container flex flex-col gap-1 px-4 py-4">
            <Link
              to="/"
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            {user ? (
              <Link
                to="/orders"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
            ) : null}
            {user && hasAppRole(user.roles, "ADMIN") ? (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            {user && hasAppRole(user.roles, ["ADMIN", "WAREHOUSE"]) ? (
              <Link
                to="/warehouse"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isHome ? "text-white hover:bg-white/10" : "hover:bg-gray-50",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Warehouse className="h-4 w-4" />
                Warehouse
              </Link>
            ) : null}
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className={cn("mt-2 w-full", isHome && "border-white/40 text-white hover:bg-white/10")}
                type="button"
                onClick={() => void handleLogout()}
              >
                Sign out
              </Button>
            ) : (
              <div className={cn("mt-3 flex gap-2 border-t pt-4", isHome ? "border-white/10" : "border-gray-100")}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("flex-1", isHome && "border-white/40 text-white hover:bg-white/10")}
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 font-semibold text-white"
                  type="button"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
