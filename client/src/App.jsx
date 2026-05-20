import React, { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNav from './components/MobileNav'
import CartDrawer from './features/cart/components/CartDrawer'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { setGlobalNavigate } from './lib/navigation'
import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Header />
      <main className='pb-24 md:pb-16 px-4 min-h-screen flex-1 max-w-7xl w-full mx-auto'>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <Toaster />
    </div>
  );
}

export default App