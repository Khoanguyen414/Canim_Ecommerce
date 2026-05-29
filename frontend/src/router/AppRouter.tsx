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
import OrderDetailPage from "@/pages/orders/OrderDetailPage"
import OrderPaymentPage from "@/pages/orders/OrderPaymentPage"
import PaymentReturnPage from "@/pages/payment/PaymentReturnPage"
import PersonalQrPaymentPage from "@/pages/payment/PersonalQrPaymentPage"
import AccountProfile from "@/pages/account/AccountProfile"
import AddressBookPage from "@/pages/account/AddressBookPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import ContactPage from "@/pages/contact/ContactPage"
import WarehouseDashboard from "@/pages/warehouse/WarehouseDashboard"

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
    <Route path="/register" element={<Navigate to="/?auth=register" replace />} />

    <Route element={<MainLayout />}>
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        path="/orders/:id/pay"
        element={
          <ProtectedRoute>
            <OrderPaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/qr-pay"
        element={
          <ProtectedRoute>
            <PersonalQrPaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
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

      <Route path="/payment/vnpay-return" element={<PaymentReturnPage gateway="vnpay" />} />
      <Route path="/payment/momo-return" element={<PaymentReturnPage gateway="momo" />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/addresses"
        element={
          <ProtectedRoute>
            <AddressBookPage />
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
