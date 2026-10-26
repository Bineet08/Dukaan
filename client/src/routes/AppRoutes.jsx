import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import { Grid } from 'lucide-react'

const Home = lazy(() => import("../features/home/pages/HomePage"))
const Products = lazy(() => import("../features/products/pages/ProductsPage"))
const Contact = lazy(() => import("../features/contact/pages/ContactPage"))
const Login = lazy(() => import("../features/auth/pages/LoginPage"))
const Register = lazy(() => import("../features/auth/pages/RegisterPage"))
const Cart = lazy(() => import("../features/cart/pages/CartPage"))
const Orders = lazy(() => import('../features/orders/pages/OrdersPage'))
const Settings = lazy(() => import('../features/auth/pages/SettingsPage'))
const Account = lazy(() => import('../features/auth/pages/AccountPage'))
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboardPage'))
const AdminProducts = lazy(() => import('../features/products/pages/AdminProductsPage'))
const AdminUsers = lazy(() => import('../features/auth/pages/AdminUsersPage'))
const AdminOrders = lazy(() => import('../features/orders/pages/AdminOrdersPage'))
const AdminMessages = lazy(() => import('../features/contact/pages/AdminMessagesPage'))

// FIX BUG-20: Normalized CRLF (\r\n) line endings to LF (\n)
const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div role="status" aria-label="Loading page" className="min-h-[60vh] flex items-center justify-center">
        <Grid className="h-8 w-8 text-green-600 animate-pulse" aria-hidden="true" />
      </div>
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
        />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        } />
        <Route path="/admin/messages" element={
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        } />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes