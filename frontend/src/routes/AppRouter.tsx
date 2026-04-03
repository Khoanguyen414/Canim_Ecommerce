import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import MainLayout from "@/layouts/MainLayout"

// Auth Pages
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"

// User Pages
import HomePage from "@/pages/user/HomePage"

// Shopping Pages
import Products from "@/pages/shopping/Products"
import ProductDetail from "@/pages/shopping/ProductDetail"
import Categories from "@/pages/shopping/Categories"

// Cart & Checkout
import Cart from "@/pages/checkout/Cart"
import Checkout from "@/pages/checkout/Checkout"
import OrderConfirm from "@/pages/checkout/OrderConfirm"

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard"

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.roles?.includes("ADMIN")
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />
}

const AppRouter = () => (
  <Routes>
    {/* Public Auth Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Main Layout Routes */}
    <Route element={<MainLayout />}>
      {/* Home */}
      <Route path="/" element={<HomePage />} />

      {/* Shopping */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/categories" element={<Categories />} />

      {/* Cart & Checkout */}
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

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
)

export default AppRouter
