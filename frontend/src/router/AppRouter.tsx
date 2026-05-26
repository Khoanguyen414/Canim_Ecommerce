import { Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { RoleRoute } from "./RoleRoute"

import Home from "@/pages/home/Home"
import Products from "@/pages/shopping/Products"
import ProductDetail from "@/pages/shopping/ProductDetail"
import FavoritesPage from "@/pages/shopping/FavoritesPage"
import Cart from "@/pages/checkout/Cart"
import Checkout from "@/pages/checkout/Checkout"
import OrderConfirm from "@/pages/checkout/OrderConfirm"
import OrderHistory from "@/pages/orders/OrderHistory"
import AccountProfile from "@/pages/account/AccountProfile"
import ContactPage from "@/pages/contact/ContactPage"
import WarehouseDashboard from "@/pages/warehouse/WarehouseDashboard"

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
    <Route path="/register" element={<Navigate to="/?auth=register" replace />} />

    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/categories" element={<Navigate to="/products" replace />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<ContactPage />} />
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
        path="/account"
        element={
          <ProtectedRoute>
            <AccountProfile />
          </ProtectedRoute>
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
