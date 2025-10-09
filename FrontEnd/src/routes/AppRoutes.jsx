import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home"
import Products from "../pages/Products"
import Contact from "../pages/Contact"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}

export default AppRoutes