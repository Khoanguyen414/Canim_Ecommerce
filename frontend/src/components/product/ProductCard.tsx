import { ShoppingCart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  inStock: boolean
  isNew?: boolean
  discount?: number
  onAddToCart?: (productId: string) => void
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  inStock,
  isNew,
  discount,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-secondary aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isNew && <Badge className="bg-blue-500">Mới</Badge>}
          {discount && <Badge className="bg-destructive">{discount}%</Badge>}
          {!inStock && <Badge  className="bg-muted">Hết hàng</Badge>}
        </div>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4 gap-2">
          <Button
            size="sm"
            className="w-full"
            disabled={!inStock}
            onClick={() => onAddToCart?.(id)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">${price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
          </div>

          {!inStock && (
            <p className="text-xs text-destructive font-medium">Hết hàng</p>
          )}
        </div>
      </div>
    </div>
  )
}
