import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Products from "./pages/Products"
import Contact from "./pages/Contact"
import AppRoutes from './routes/AppRoutes'

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <main className='pt-16 pb-16 px-4 min-h-screen'>
        <AppRoutes/>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App