import { Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"
import { ProtectedRoute } from "@/components/routing/ProtectedRoute"
import { RoleRoute } from "@/components/routing/RoleRoute"

import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import Home from "@/pages/home/Home"
import Products from "@/pages/shopping/Products"
import ProductDetail from "@/pages/shopping/ProductDetail"
import Categories from "@/pages/shopping/Categories"
import Cart from "@/pages/checkout/Cart"
import Checkout from "@/pages/checkout/Checkout"
import OrderConfirm from "@/pages/checkout/OrderConfirm"
import OrderHistory from "@/pages/orders/OrderHistory"
import AdminDashboard from "@/pages/admin/Dashboard"
import WarehouseDashboard from "@/pages/warehouse/WarehouseDashboard"

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/cart" element={<Cart />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/confirm"
        element={
          <ProtectedRoute>
            <OrderConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute allow="ADMIN">
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/warehouse"
        element={
          <RoleRoute allow={["ADMIN", "WAREHOUSE"]}>
            <WarehouseDashboard />
          </RoleRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
)

export default AppRouter
