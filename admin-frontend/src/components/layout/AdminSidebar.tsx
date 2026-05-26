import { useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react"
import { isNavGroup, navEntries, type NavItem } from "@/config/navigation"
import { AdminBrandLogo } from "@/components/layout/AdminBrandLogo"

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? "http://localhost:5173"

const PROMO_IMAGE =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=560&h=280&q=85"

type Props = {
  open: boolean
  onClose: () => void
}

function navItemClass(isActive: boolean, item: NavItem) {
  const parts = ["nav-item"]
  if (isActive) parts.push("active")
  else if (item.highlight) parts.push("nav-item-highlight")
  if (item.soon || !item.to) parts.push("nav-item-disabled")
  return parts.join(" ")
}

export function AdminSidebar({ open, onClose }: Props) {
  const location = useLocation()
  const inventoryActive = location.pathname.startsWith("/warehouses")
  const [inventoryOpen, setInventoryOpen] = useState(inventoryActive)

  return (
    <>
      <div className={`sidebar-backdrop${open ? " visible" : ""}`} onClick={onClose} aria-hidden />
      <aside className={`sidebar${open ? " open" : ""}`}>
        <header className="sidebar-brand">
          <Link to="/" className="sidebar-brand-link" onClick={onClose} aria-label="Canim — về Dashboard">
            <AdminBrandLogo variant="header" />
          </Link>
        </header>

        <nav className="sidebar-nav" aria-label="Menu chính">
          {navEntries.map((entry) => {
            if (isNavGroup(entry)) {
              const Icon = entry.icon
              const openGroup = inventoryOpen || inventoryActive
              return (
                <div key={entry.label} className={`nav-group${openGroup ? " open" : ""}`}>
                  <button
                    type="button"
                    className={`nav-item nav-group-toggle${inventoryActive ? " nav-group-active" : ""}`}
                    onClick={() => setInventoryOpen((v) => !v)}
                    aria-expanded={openGroup}
                  >
                    <Icon size={20} strokeWidth={1.75} aria-hidden />
                    <span className="nav-item-label">{entry.label}</span>
                    <ChevronDown size={16} className="nav-group-chevron" aria-hidden />
                  </button>
                  <div className="nav-group-children">
                    {entry.children.map((child) => {
                      if (child.soon || !child.to) {
                        return (
                          <span key={child.label} className="nav-item nav-item-child nav-item-disabled" title="Sắp ra mắt">
                            {child.label}
                          </span>
                        )
                      }
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          className={({ isActive }) =>
                            ["nav-item", "nav-item-child", isActive ? "active" : ""].filter(Boolean).join(" ")
                          }
                          onClick={onClose}
                        >
                          <span className="nav-item-label">{child.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const item = entry
            const Icon = item.icon
            const badge =
              item.badgeText && item.badge === "outline" ? (
                <span className="nav-badge nav-badge-outline">{item.badgeText}</span>
              ) : item.badgeText ? (
                <span className="nav-badge">{item.badgeText}</span>
              ) : null

            if (item.soon || !item.to) {
              return (
                <span key={item.label} className={navItemClass(false, item)} title="Sắp ra mắt">
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                  <span className="nav-item-label">{item.label}</span>
                  {badge}
                </span>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navItemClass(isActive, item)}
                onClick={onClose}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                <span className="nav-item-label">{item.label}</span>
                {badge}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-promo">
          <div className="sidebar-promo-hero">
            <img src={PROMO_IMAGE} alt="" loading="lazy" />
            <div className="sidebar-promo-hero-fade" aria-hidden />
          </div>

          <div className="sidebar-promo-body">
            <p className="sidebar-promo-tagline">NEW COLLECTION</p>
            <a className="sidebar-promo-btn" href={STOREFRONT_URL} target="_blank" rel="noreferrer">
              Xem ngay
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </a>
          </div>
        </div>

        <footer className="sidebar-footer">
          <a className="sidebar-store-link" href={STOREFRONT_URL} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden />
            Truy cập website
          </a>
          <p className="sidebar-copyright">© 2024 Canim Fashion. All rights reserved.</p>
        </footer>
      </aside>
    </>
  )
}
