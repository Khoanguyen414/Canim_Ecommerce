import { Grid2x2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Categories() {
  const navigate = useNavigate()

  const categories = [
    {
      id: 1,
      name: "Áo",
      icon: "👕",
      count: 1250,
      image: "https://via.placeholder.com/300x200?text=Áo",
    },
    {
      id: 2,
      name: "Quần",
      icon: "👖",
      count: 890,
      image: "https://via.placeholder.com/300x200?text=Quần",
    },
    {
      id: 3,
      name: "Giày",
      icon: "👟",
      count: 560,
      image: "https://via.placeholder.com/300x200?text=Giày",
    },
    {
      id: 4,
      name: "Phụ kiện",
      icon: "👜",
      count: 2100,
      image: "https://via.placeholder.com/300x200?text=Phụ+kiện",
    },
    {
      id: 5,
      name: "Đồ lót",
      icon: "🧦",
      count: 450,
      image: "https://via.placeholder.com/300x200?text=Đồ+lót",
    },
    {
      id: 6,
      name: "Thời trang nữ",
      icon: "👗",
      count: 3200,
      image: "https://via.placeholder.com/300x200?text=Nữ",
    },
  ]

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Grid2x2 className="w-10 h-10" />
          Danh Mục Sản Phẩm
        </h1>
        <p className="text-muted-foreground text-lg">
          Khám phá các danh mục sản phẩm của chúng tôi
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative overflow-hidden bg-secondary aspect-video h-40">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold">{category.name}</h2>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>{category.count} sản phẩm</span>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Xem tất cả
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Featured Section */}
      <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Khuyến Mãi Đặc Biệt</h2>
            <p className="text-muted-foreground mb-6">
              Tất cả danh mục hiện đang có giảm giá lên đến 40% cho khách hàng mới!
            </p>
            <Button size="lg">Mua Ngay</Button>
          </div>
          <div className="text-5xl text-center">🎉</div>
        </div>
      </div>
    </div>
  )
}
