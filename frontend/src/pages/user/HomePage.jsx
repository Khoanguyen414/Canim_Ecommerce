import { ArrowRight, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product/ProductCard"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()

  const featuredProducts = [
    {
      id: "1",
      name: "Áo thun nam cổ tròn cao cấp",
      price: 199000,
      originalPrice: 299000,
      image: "https://via.placeholder.com/300x300?text=Áo+thun",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      isNew: true,
      discount: 33,
    },
    {
      id: "2",
      name: "Quần jeans nam ôm sát",
      price: 399000,
      originalPrice: 599000,
      image: "https://via.placeholder.com/300x300?text=Quần+jeans",
      rating: 4,
      reviews: 95,
      inStock: true,
      discount: 33,
    },
    {
      id: "3",
      name: "Giày sneaker thời trang",
      price: 799000,
      image: "https://via.placeholder.com/300x300?text=Giày+sneaker",
      rating: 5,
      reviews: 256,
      inStock: true,
    },
    {
      id: "4",
      name: "Mũ snapback thể thao",
      price: 149000,
      image: "https://via.placeholder.com/300x300?text=Mũ",
      rating: 4.5,
      reviews: 72,
      inStock: false,
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-white/20">🎉 Khuyến mãi lớn</Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Mua Sắm Thả Ga, Giá Tốt Mỗi Ngày
              </h1>
              <p className="text-lg text-white/90">
                Khám phá bộ sưu tập thời trang và phụ kiện tuyệt vời của chúng tôi. Giảm giá lên đến 50% cho các sản phẩm được chọn.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("/products")}
                >
                  Mua Ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Xem Chi Tiết
                </Button>
              </div>
            </div>
            <div className="hidden md:block text-6xl text-center">🛍️</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🚚", title: "Giao hàng nhanh", desc: "Giao hàng miễn phí cho đơn từ $50" },
            { icon: "🛡️", title: "An toàn", desc: "Thanh toán an toàn 100%" },
            { icon: "↩️", title: "Hoàn tiền dễ", desc: "30 ngày hoàn tiền không hỏi" },
          ].map((feature, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Zap className="w-8 h-8 text-primary" />
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-muted-foreground">Những sản phẩm bán chạy nhất tuần này</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={(id) => {
                console.log("Add to cart:", id)
              }}
            />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary/50 py-12 my-8">
        <div className="container max-w-2xl">
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <Star className="w-8 h-8 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Nhận Ưu Đãi Độc Quyền</h2>
            <p className="text-muted-foreground">
              Đăng ký nhận bản tin của chúng tôi để có được các ưu đãi độc quyền, bài viết mới nhất và nhiều hơn nữa.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-2 border border-border rounded-md bg-white"
              />
              <Button>Đăng Ký</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="container py-12">
        <h2 className="text-3xl font-bold mb-8">Danh Mục Phổ Biến</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["👕 Áo", "👖 Quần", "👟 Giày", "👜 Phụ kiện"].map((cat) => (
            <Card key={cat} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <p className="text-3xl mb-2">{cat.split(" ")[0]}</p>
              <p className="font-medium">{cat.split(" ")[1]}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white py-16 my-8">
        <div className="container text-center space-y-4">
          <h2 className="text-3xl font-bold">Sẵn sàng bắt đầu mua sắm?</h2>
          <p className="text-lg text-white/90">
            Tìm hiểu thêm về các sản phẩm mới nhất của chúng tôi ngay hôm nay
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Khám Phá Ngay
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
