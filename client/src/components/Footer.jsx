import React, { useEffect, useState, useRef, useCallback } from 'react'

const Footer = () => {
  const [isVisible, setIsVisible] = useState(true)
  // FIX BUG-26: use a ref for lastScrollY so the scroll handler always
  // reads the latest value without needing it in the useEffect dependency array
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const currScrollY = window.scrollY
    // FIX BUG-21: the original code had setIsVisible(currScrollY) running
    // unconditionally (outside the else-if), setting a number instead of boolean.
    // Now uses proper if/else with boolean values only.
    if (currScrollY > lastScrollY.current && currScrollY > 100) {
      setIsVisible(false)
    } else if (currScrollY < lastScrollY.current) {
      setIsVisible(true)
    }
    lastScrollY.current = currScrollY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <footer className={`bg-gray-600 h-16 w-full fixed bottom-0 flex items-center justify-center z-50 transition-transform duration-150 ${
    isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className='text-sm text-white'>
        Managed By Ankit...
      </div>
    </footer>
  )
}

export default Footer