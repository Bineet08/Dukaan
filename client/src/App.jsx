import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <main className='pt-16 pb-16 px-4 min-h-screen'>
          <AppRoutes />
        </main>
        <Footer />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App