import { BarChart3, Users, ShoppingBag, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const stats = [
    { title: "Tổng Doanh Số", value: "$15,234.00", change: "+12.5%", icon: TrendingUp },
    { title: "Tổng Đơn Hàng", value: "1,234", change: "+8.2%", icon: ShoppingBag },
    { title: "Khách Hàng", value: "5,678", change: "+5.3%", icon: Users },
    { title: "Lợi Nhuận", value: "$3,456.00", change: "+15.1%", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-secondary/20 p-6">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Quản Trị</h1>
          <p className="text-muted-foreground">Xin chào, Admin! Đây là tổng quan của bạn.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-primary opacity-50" />
                </div>
                <p className="text-sm text-green-600">
                  <span className="font-semibold">{stat.change}</span> so với tháng trước
                </p>
              </Card>
            )
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quản Lý Sản Phẩm</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                Thêm Sản Phẩm Mới
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Chỉnh Sửa Sản Phẩm
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Quản Lý Danh Mục
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Xem Tồn Kho
              </Button>
            </div>
          </Card>

          {/* Orders Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quản Lý Đơn Hàng</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                Xem Tất Cả Đơn Hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Đơn Hàng Chờ Xử Lý
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Đơn Hàng Đã Giao
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Hoàn Tiền/Trả Hàng
              </Button>
            </div>
          </Card>

          {/* Users Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quản Lý Khách Hàng</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                Xem Tất Cả Khách Hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Khách Hàng Mới
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Quản Lý Quyền Hạn
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Phân Tích Hành Vi
              </Button>
            </div>
          </Card>

          {/* Reports */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Báo Cáo</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                Doanh Số Bán Hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Báo Cáo Chi Phí
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Báo Cáo Khách Hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Xuất Báo Cáo
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Hoạt Động Gần Đây</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <p>Đơn hàng #ORD-123456 đã được xác nhận</p>
              <p className="text-sm text-muted-foreground">2 giờ trước</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <p>Khách hàng mới đăng ký</p>
              <p className="text-sm text-muted-foreground">30 phút trước</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <p>Cập nhật sản phẩm "Áo thun nam"</p>
              <p className="text-sm text-muted-foreground">1 giờ trước</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
