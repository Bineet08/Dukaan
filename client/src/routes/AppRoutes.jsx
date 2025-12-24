import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home"
import Products from "../pages/Products"
import Contact from "../pages/Contact"
import Login from '../pages/Login'
import Register from '../pages/Register'
import Cart from '../pages/Cart'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import Orders from '../pages/Orders'
import Settings from '../pages/Settings'
import Account from '../pages/Account'
import AdminDashboard from '../pages/AdminDashboard'
import AdminProducts from '../pages/AdminProducts'
import AdminUsers from '../pages/AdminUsers'
import AdminOrders from '../pages/AdminOrders'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/account" element={
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      } />
      <Route path="cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
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
    </Routes>
  )
}

export default AppRoutes