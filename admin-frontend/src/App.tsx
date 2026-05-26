import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { ProductPage } from "@/pages/products/ProductPage.jsx"
import { CategoriesPage } from "@/pages/categories/CategoriesPage"
import { SuppliersPage } from "@/pages/suppliers/SuppliersPage"
import { WarehouseHubPage } from "@/pages/inventory/WarehouseHubPage"
import { WarehousesPage } from "@/pages/warehouses/WarehousesPage"
import { UsersPage } from "@/pages/users/UsersPage"
import { RolesPage } from "@/pages/roles/RolesPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/warehouses" element={<WarehouseHubPage />} />
          <Route path="/warehouses/manage" element={<WarehousesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
