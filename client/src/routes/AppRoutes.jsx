import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home"
import Products from "../pages/Products"
import Contact from "../pages/Contact"
import Login from '../pages/Login'
import Register from '../pages/Register'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default AppRoutes