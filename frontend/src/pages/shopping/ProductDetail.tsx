import { useState } from "react"
import { useParams } from "react-router-dom"
import { Star, ShoppingCart, Heart, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"

export default function ProductDetail() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("black")
  const [selectedSize, setSelectedSize] = useState("M")

  // Mock data
  const product = {
    id,
    name: "Áo thun nam cổ tròn cao cấp",
    price: 199000,
    originalPrice: 299000,
    rating: 4.5,
    reviews: 128,
    inStock: true,
    description:
      "Áo thun nam cổ tròn thoải mái với chất liệu cotton 100%. Phù hợp cho mọi dịp từ casual đến semi-formal.",
    images: [
      "https://via.placeholder.com/500x500?text=Áo+thun+1",
      "https://via.placeholder.com/500x500?text=Áo+thun+2",
      "https://via.placeholder.com/500x500?text=Áo+thun+3",
    ],
    colors: ["black", "white", "navy", "gray"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: {
      material: "Cotton 100%",
      care: "Giặt nước lạnh, không tẩy",
      origin: "Việt Nam",
      warranty: "12 tháng",
    },
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg overflow-hidden aspect-square">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                className="bg-secondary rounded-lg overflow-hidden aspect-square hover:ring-2 ring-primary transition-all"
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toLocaleString()}
              </span>
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice?.toLocaleString()}
              </span>
              <span className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm font-semibold">
                -33%
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{product.description}</p>

          {/* Options */}
          <div className="space-y-4 border-t border-b border-border py-4">
            {/* Color */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Màu sắc: <span className="text-primary">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border"
                    }`}
                    style={{
                      backgroundColor: {
                        black: "#000",
                        white: "#fff",
                        navy: "#001f3f",
                        gray: "#999",
                      }[color],
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Kích cỡ: <span className="text-primary">{selectedSize}</span>
              </label>
              <Select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Số lượng</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 text-center border border-border rounded-md py-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full h-11" disabled={!product.inStock}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11">
                <Heart className="w-4 h-4 mr-2" />
                Yêu thích
              </Button>
              <Button variant="outline" className="h-11">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Status */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Còn hàng</p>
                <p className="text-green-700">Giao hàng nhanh trong 1-2 ngày</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Details Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Thông tin chi tiết</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(product.details).map(([key, value]) => (
            <div key={key} className="pb-3 border-b border-border last:border-0">
              <p className="text-sm text-muted-foreground capitalize">{key}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
