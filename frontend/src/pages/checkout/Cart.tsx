import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Cart() {
  const navigate = useNavigate()

  // Mock cart items
  const cartItems = [
    {
      id: "1",
      name: "Áo thun nam cổ tròn cao cấp",
      price: 199000,
      quantity: 2,
      image: "https://via.placeholder.com/100x100?text=Áo+thun",
      color: "Black",
      size: "M",
    },
    {
      id: "2",
      name: "Quần jeans nam ôm sát",
      price: 399000,
      quantity: 1,
      image: "https://via.placeholder.com/100x100?text=Quần+jeans",
      color: "Blue",
      size: "L",
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 50000
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Giỏ hàng của bạn trống</h2>
          <p className="text-muted-foreground">Hãy bắt đầu mua sắm ngay!</p>
          <Button onClick={() => navigate("/products")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md"
                />

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.color} - Size {item.size}
                  </p>
                  <p className="font-bold text-primary mt-2">
                    ${item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>

            <div className="space-y-2 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Vận chuyển</span>
                <span>${shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Thuế (8%)</span>
                <span>${tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-primary">${total.toLocaleString()}</span>
            </div>

            <Button className="w-full h-11" onClick={() => navigate("/checkout")}>
              Tiến hành thanh toán
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
