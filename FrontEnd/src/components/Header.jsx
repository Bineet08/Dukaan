import React, { useState, useRef, useEffect } from 'react'
import logo from "../assets/logo.png"
import user from "../assets/user.png"
import { Link } from 'react-router-dom'

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleMenuItemClick = (action) => {
    console.log(`${action} clicked`)
    setIsDropdownOpen(false)
    // Add your logic here for each menu item
  }

  return (
    <header className='bg-gray-600 w-full h-16 fixed top-0 flex items-center justify-between px-4 z-50'>
      {/* Logo Section */}
      <Link to="/" className="flex-shrink-0">
        <img 
          src={logo} 
          alt="Gupta General Store" 
          className='h-12 w-auto px-8'
        />
      </Link>
      
      {/* Navigation Section */}
      <nav className="flex space-x-8 text-xl text-white">
        <Link to="/" className="text-white hover:text-gray-300 cursor-pointer transition-colors">
          Home
        </Link>
        <Link to="/products" className="text-white hover:text-gray-300 cursor-pointer transition-colors">
          Products
        </Link>
        <Link to="/contact" className="text-white hover:text-gray-300 cursor-pointer transition-colors">
          Contact
        </Link>
      </nav>
      
      {/* User Section with Dropdown */}
      <div className="flex-shrink-0 relative" ref={dropdownRef}>
        <img 
          src={user} 
          alt="User" 
          onClick={toggleDropdown}
          className='h-10 w-10 rounded-full hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-white'
        />
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            {/* User Info Section */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Welcome!</p>
              <p className="text-xs text-gray-500">Ankit</p>
            </div>
            
            {/* My Account */}
            <button
              onClick={() => handleMenuItemClick('My Account')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Account
            </button>
            
            {/* My Orders */}
            <button
              onClick={() => handleMenuItemClick('Orders')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Orders
            </button>
            
            {/* Shopping Cart */}
            <button
              onClick={() => handleMenuItemClick('Cart')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 11-4 0v-5m4 0V8a2 2 0 00-2-2H9a2 2 0 00-2 2v5" />
              </svg>
              Shopping Cart
            </button>
            
            {/* Settings */}
            <button
              onClick={() => handleMenuItemClick('Settings')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            
            {/* Logout (separated with border) */}
            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={() => handleMenuItemClick('Logout')}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header