import { Mail, Phone, MapPin, Headphones } from "lucide-react"
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaYoutube } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useAuthModalStore } from "@/store/auth-modal.store"
import { ShopLogoLink } from "@/components/layout/ShopLogoLink"

const column = (title: string, links: { to: string; label: string }[]) => (
  <div>
    <h4 className="mb-5 text-lg font-bold text-[#253d4e]">{title}</h4>
    <ul className="space-y-3 text-sm text-gray-600">
      {links.map((l) => (
        <li key={l.label}>
          <Link to={l.to} className="transition-colors hover:text-primary">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const accountLinkClass = "transition-colors hover:text-primary"

export default function Footer() {
  const openAuthModal = useAuthModalStore((s) => s.openModal)

  return (
    <footer className="mt-auto bg-white/90 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="bg-gradient-to-r from-primary/[0.09] via-[#fff0e8] to-[#ffe7dc]">
        <div className="container flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:py-12">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#253d4e] md:text-3xl">Stay home &amp; get your daily needs</h3>
            <p className="mt-2 text-gray-600">Start your daily shopping with Canim Mart — fresh picks, clear prices.</p>
          </div>
          <form
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container px-4 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-4">
              <ShopLogoLink imgClassName="!h-20" />
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
              Ho Chi Minh City, Vietnam
              <br />
              <span className="mt-2 inline-flex items-center gap-2 font-semibold text-[#253d4e]">
                <Phone className="h-4 w-4 text-primary" />
                1900-1234
              </span>
              <br />
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@canimshop.com
              </span>
            </p>
            <div className="flex gap-2">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8dd] text-primary transition hover:bg-primary hover:text-white">
                <FaFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8dd] text-primary transition hover:bg-primary hover:text-white">
                <FaTwitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8dd] text-primary transition hover:bg-primary hover:text-white">
                <FaInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8dd] text-primary transition hover:bg-primary hover:text-white">
                <FaPinterest className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8dd] text-primary transition hover:bg-primary hover:text-white">
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {column("Company", [
              { to: "#", label: "About us" },
              { to: "#", label: "Delivery information" },
              { to: "#", label: "Privacy policy" },
              { to: "#", label: "Terms & conditions" },
              { to: "/contact", label: "Contact us" },
            ])}
            <div>
              <h4 className="mb-5 text-lg font-bold text-[#253d4e]">Account</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <button type="button" className={`text-left ${accountLinkClass}`} onClick={() => openAuthModal("login")}>
                    Sign in
                  </button>
                </li>
                <li>
                  <button type="button" className={`text-left ${accountLinkClass}`} onClick={() => openAuthModal("register")}>
                    Register
                  </button>
                </li>
                <li>
                  <Link to="/cart" className={accountLinkClass}>
                    View cart
                  </Link>
                </li>
                <li>
                  <Link to="#" className={accountLinkClass}>
                    My wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className={accountLinkClass}>
                    Track order
                  </Link>
                </li>
              </ul>
            </div>
            {column("Corporate", [
              { to: "#", label: "Become a vendor" },
              { to: "#", label: "Affiliate program" },
              { to: "#", label: "Farm business" },
              { to: "#", label: "Careers" },
              { to: "#", label: "Our suppliers" },
            ])}
            {column("Popular", [
              { to: "/products", label: "Milk & dairies" },
              { to: "/products", label: "Coffee & teas" },
              { to: "/products", label: "Pet foods" },
              { to: "/products", label: "Baking material" },
              { to: "/products", label: "Fresh fruit" },
            ])}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-stretch justify-between gap-6 pt-10 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#253d4e]">Install app</p>
            <p className="text-xs text-gray-500">From App Store or Google Play</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">App Store</span>
              <span className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">Google Play</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500">Secured payment gateways</span>
            <img src="/visa.svg" alt="Visa" className="h-6 opacity-80" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-6 opacity-80" />
            <img src="/paypal.svg" alt="PayPal" className="h-6 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-[#f7f7f7]">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-gray-600 md:flex-row">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()}, <strong className="text-[#253d4e]">Canim</strong> — storefront UI
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-[#253d4e]">
            <span className="inline-flex items-center gap-1">
              <Headphones className="h-4 w-4 text-primary" />
              1900-888
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              Support center
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
