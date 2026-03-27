import { Mail, Phone, MapPin } from "lucide-react"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">CanimShop</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nền tảng mua sắm trực tuyến hàng đầu với sản phẩm chất lượng và
              giá tốt nhất.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="p-2 hover:bg-background rounded-md transition-colors"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-background rounded-md transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-background rounded-md transition-colors"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-muted-foreground hover:text-primary"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Chính sách trả hàng
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>1900 1234</span>
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>support@canimshop.com</span>
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Tp. HCM, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2024 CanimShop. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <img src="/visa.svg" alt="Visa" className="h-6" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="/paypal.svg" alt="PayPal" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  )
}
