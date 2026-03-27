import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function OrderConfirm() {
  const navigate = useNavigate()

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground text-lg">
            Cảm ơn bạn đã mua sắm. Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
              <p className="font-bold text-lg">#ORD-123456</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt</p>
              <p className="font-bold text-lg">27/03/2024</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="font-bold text-lg text-primary">$700.000</p>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Trạng thái đơn hàng
            </h3>
            <div className="space-y-3">
              {[
                { status: "Đã đặt hàng", date: "27/03/2024 14:30", active: true },
                { status: "Đã xác nhận", date: "Trong 2 giờ", active: false },
                { status: "Đang chuẩn bị", date: "Trong 24 giờ", active: false },
                { status: "Đã giao cho đơn vị vận chuyển", date: "Trong 2-3 ngày", active: false },
                { status: "Đã giao", date: "Trong 5 ngày", active: false },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        item.active ? "bg-primary" : "bg-border"
                      }`}
                    />
                    {i < 4 && (
                      <div
                        className={`w-1 h-8 ${
                          item.active ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`font-medium ${
                        item.active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-blue-900">Tiếp theo:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Kiểm tra email xác nhận đơn hàng</li>
              <li>Theo dõi trạng thái vận chuyển theo thời gian thực</li>
              <li>Chuẩn bị tiếp nhận hàng trong thời gian dự kiến</li>
            </ul>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </Button>
          <Button variant="outline">
            Xem đơn hàng
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Contact */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Cần giúp đỡ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:
          </p>
          <div className="space-y-1 text-sm">
            <p>📧 support@canimshop.com</p>
            <p>📱 1900 1234</p>
            <p>💬 Chat trực tiếp (7:00 - 22:00)</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
