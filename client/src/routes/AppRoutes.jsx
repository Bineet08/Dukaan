import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "../features/home/pages/HomePage"
import Products from "../features/products/pages/ProductsPage"
import Contact from "../features/contact/pages/ContactPage"
import Login from "../features/auth/pages/LoginPage"
import Register from "../features/auth/pages/RegisterPage"
import Cart from "../features/cart/pages/CartPage"
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import Orders from '../features/orders/pages/OrdersPage'
import Settings from '../features/auth/pages/SettingsPage'
import Account from '../features/auth/pages/AccountPage'
import AdminDashboard from '../features/admin/pages/AdminDashboardPage'
import AdminProducts from '../features/products/pages/AdminProductsPage'
import AdminUsers from '../features/auth/pages/AdminUsersPage'
import AdminOrders from '../features/orders/pages/AdminOrdersPage'
import AdminMessages from '../features/contact/pages/AdminMessagesPage'

// FIX BUG-20: Normalized CRLF (\r\n) line endings to LF (\n)
const AppRoutes = () => {
  return (
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
  )
}

export default AppRoutes