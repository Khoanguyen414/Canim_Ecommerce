import { Mail, Phone, MapPin } from "lucide-react"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/50">
      <div className="container py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">canim ecommerce</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Your trusted online shopping destination with quality products and great prices.
            </p>
            <div className="flex gap-2">
              <a href="#" className="rounded-md p-2 transition-colors hover:bg-background">
                <FaFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-md p-2 transition-colors hover:bg-background">
                <FaInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-md p-2 transition-colors hover:bg-background">
                <FaTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Return policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Terms of use
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span>support@canimshop.com</span>
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Ho Chi Minh City, Vietnam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} canim ecommerce. All rights reserved.</p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <img src="/visa.svg" alt="Visa" className="h-6" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="/paypal.svg" alt="PayPal" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  )
}
