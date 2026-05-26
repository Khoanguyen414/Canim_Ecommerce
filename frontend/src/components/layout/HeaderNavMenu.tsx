import { ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { MAIN_NAV, HEADER_PROMO, isNavLinkActive } from "@/config/headerNav"
import { productsUrl } from "@/config/productFacets"
import { cn } from "@/lib/cn"

type HeaderNavMenuProps = {
  pathname: string
  search: string
  variant: "desktop" | "mobile"
  onNavigate?: () => void
  showPromo?: boolean
}

function normalizeSearch(search: string): string {
  return search.startsWith("?") ? search.slice(1) : search
}

function linkActive(pathname: string, search: string, to: string): boolean {
  const base = to.split("?")[0]
  if (pathname !== base) return isNavLinkActive(pathname, to)
  const targetQs = to.includes("?") ? to.slice(to.indexOf("?") + 1) : ""
  const currentQs = normalizeSearch(search)
  if (!targetQs) return !currentQs
  return targetQs === currentQs
}

export function HeaderNavMenu({
  pathname,
  search,
  variant,
  onNavigate,
  showPromo = true,
}: HeaderNavMenuProps) {
  const isDesktop = variant === "desktop"

  const itemClass = (active: boolean) =>
    isDesktop
      ? cn(
          "whitespace-nowrap transition hover:text-primary",
          active && "text-primary underline decoration-primary underline-offset-4",
        )
      : cn(
          "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
          active
            ? "bg-primary text-white shadow-sm shadow-primary/20"
            : "text-[#253d4e] hover:bg-primary/10 hover:text-primary",
        )

  const wrapClass = isDesktop
    ? "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.1em] text-neutral-900 xl:gap-x-4 xl:text-[13px]"
    : "flex flex-col gap-1"

  return (
    <nav className={wrapClass}>
      {showPromo ? (
        <Link
          to={HEADER_PROMO.to}
          className={
            isDesktop
              ? "whitespace-nowrap text-primary hover:text-primary/80"
              : "rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
          }
          onClick={onNavigate}
        >
          {HEADER_PROMO.label}
        </Link>
      ) : null}

      {MAIN_NAV.map((item) => {
        if (item.type === "link") {
          const active = linkActive(pathname, search, item.to)
          return (
            <Link key={item.label} to={item.to} className={itemClass(active)} onClick={onNavigate}>
              {item.label}
            </Link>
          )
        }

        if (item.type === "dropdown") {
          if (isDesktop) {
            return (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-primary"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="pointer-events-none invisible absolute left-0 top-full z-[80] w-56 pt-2 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="pointer-events-auto rounded-lg border border-[#f2e7eb] bg-white p-1.5 shadow-xl normal-case tracking-normal">
                    {item.items.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        className="block rounded-md px-3 py-2 text-[15px] text-[#374151] hover:text-primary"
                        onClick={onNavigate}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="px-3 pt-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                {item.label}
              </span>
              {item.items.map((child) => {
                const active = linkActive(pathname, search, child.to)
                return (
                  <Link
                    key={child.label}
                    to={child.to}
                    className={cn(itemClass(active), "pl-5")}
                    onClick={onNavigate}
                  >
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )
        }

        const genderHome = productsUrl({ gender: item.gender })

        if (isDesktop) {
          return (
            <div key={item.label} className="group relative">
              <Link
                to={genderHome}
                className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-primary"
                onClick={onNavigate}
              >
                {item.label}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="pointer-events-none invisible absolute left-0 top-full z-[80] w-[920px] max-w-[92vw] pt-2 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                <div className="pointer-events-auto rounded-xl border border-[#f2e7eb] bg-white px-5 py-4 shadow-xl normal-case tracking-normal">
                  <div className="mb-3 border-b border-[#f2e7eb] pb-2">
                    <Link
                      to={genderHome}
                      className="text-base font-semibold text-primary hover:underline"
                      onClick={onNavigate}
                    >
                      Xem tất cả {item.label.toLowerCase()}
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 gap-8">
                    {item.groups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 text-base font-bold text-[#1f2937]">{group.title}</p>
                        <div className="space-y-1">
                          {group.items.map((child) => (
                            <Link
                              key={child.label}
                              to={productsUrl(child.facets)}
                              className="block py-1 text-[15px] text-[#374151] hover:text-primary"
                              onClick={onNavigate}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div key={item.label} className="flex flex-col gap-0.5">
            <Link
              to={genderHome}
              className="px-3 pt-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-primary"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
            {item.groups.map((group) => (
              <div key={group.title} className="pl-2">
                <span className="block px-3 py-1 text-[11px] font-semibold text-neutral-600">{group.title}</span>
                {group.items.map((child) => (
                  <Link
                    key={child.label}
                    to={productsUrl(child.facets)}
                    className="block rounded-lg px-5 py-2 text-sm text-[#253d4e] hover:bg-primary/10 hover:text-primary"
                    onClick={onNavigate}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )
      })}
    </nav>
  )
}
