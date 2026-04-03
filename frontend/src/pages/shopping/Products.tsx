import { useState } from "react"
import { Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import ProductCard from "@/components/product/ProductCard"

export default function Products() {
  const [sortBy, setSortBy] = useState("latest")
  const [priceRange, setPriceRange] = useState("all")

  // Mock product data
  const products = [
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
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh Sách Sản Phẩm</h1>
        <p className="text-muted-foreground">
          Khám phá bộ sưu tập các sản phẩm mới nhất
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Bộ Lọc
              </h3>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input placeholder="Tên sản phẩm..." />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá</label>
              <Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="all">Tất cả giá</option>
                <option value="0-200">Dưới 200K</option>
                <option value="200-500">200K - 500K</option>
                <option value="500-1000">500K - 1M</option>
                <option value="1000">Trên 1M</option>
              </Select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh Mục</label>
              <div className="space-y-2">
                {["Áo", "Quần", "Giày", "Phụ kiện"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Đánh Giá</label>
              <div className="space-y-2">
                {["5", "4", "3"].map((star) => (
                  <label key={star} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    {star} sao trở lên
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Đặt Lại Bộ Lọc
            </Button>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Hiển thị {products.length} sản phẩm
            </p>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Mới nhất</option>
              <option value="popular">Bán chạy</option>
              <option value="price-low">Giá: Thấp đến Cao</option>
              <option value="price-high">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={(id) => console.log("Add to cart:", id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" disabled>
              Trước
            </Button>
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={page === 1 ? "default" : "outline"}
              >
                {page}
              </Button>
            ))}
            <Button variant="outline">Tiếp</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
