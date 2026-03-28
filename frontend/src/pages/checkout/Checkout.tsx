import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MapPin, CreditCard, Truck } from "lucide-react"

export default function Checkout() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "card",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh Toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <Input
                placeholder="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                placeholder="Địa chỉ đầy đủ"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <div className="grid grid-cols-3 gap-4">
                <Select name="city" value={formData.city} onChange={handleChange}>
                  <option value="">Tỉnh/TP</option>
                  <option value="hcm">Tp. Hồ Chí Minh</option>
                  <option value="hn">Hà Nội</option>
                </Select>
                <Select name="district" value={formData.district} onChange={handleChange}>
                  <option value="">Quận/Huyện</option>
                  <option value="d1">Quận 1</option>
                </Select>
                <Select name="ward" value={formData.ward} onChange={handleChange}>
                  <option value="">Phường/Xã</option>
                  <option value="p1">Phường 1</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5" />
                Phương thức vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "fast", name: "Giao hàng nhanh (1-2 ngày)", price: 50000 },
                { id: "standard", name: "Giao hàng tiêu chuẩn (3-5 ngày)", price: 25000 },
                { id: "economy", name: "Giao hàng tiết kiệm (5-7 ngày)", price: 10000 },
              ].map((method) => (
                <label key={method.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                  <input type="radio" name="shipping" defaultChecked={method.id === "fast"} />
                  <div className="flex-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${method.price.toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Step 3: Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "card", name: "Thẻ tín dụng/Ghi nợ", icon: "💳" },
                { id: "wallet", name: "Ví điện tử", icon: "📱" },
                { id: "bank", name: "Chuyển khoản ngân hàng", icon: "🏦" },
                { id: "cash", name: "Thanh toán khi nhận hàng", icon: "💵" },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-6 space-y-4">
            <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>

            <div className="space-y-2 bg-secondary p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>$598.000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Vận chuyển</span>
                <span>$50.000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Thuế (8%)</span>
                <span>$52.000</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-primary">$700.000</span>
            </div>

            <Button className="w-full h-11" onClick={() => window.location.href = "/orders/1/confirm"}>
              Đặt hàng
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Bằng cách nhấp vào "Đặt hàng", bạn đồng ý với các{" "}
              <a href="#" className="text-primary hover:underline">
                Điều khoản
              </a>{" "}
              của chúng tôi
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
