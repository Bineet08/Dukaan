import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home"
import Products from "../pages/Products"
import Contact from "../pages/Contact"
import Login from '../pages/Login'
import Register from '../pages/Register'
import Cart from '../pages/Cart'
import ProtectedRoute from './ProtectedRoute'
import Orders from '../pages/Orders'
import Settings from '../pages/Settings'
import Account from '../pages/Account'

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
    </Routes>
  )
}

export default AppRoutes