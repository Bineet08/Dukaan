import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div>
      <Header />
      <main className='pt-16 pb-16 px-4 min-h-screen'>
        <AppRoutes />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App