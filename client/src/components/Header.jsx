import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import userIcon from "../assets/user.png";
import { useCart } from "../context/CartContext";
import { useUserStore } from "../stores/useUserStore";


const Header = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { cartItems } = useCart();
  const { user, logout } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (path) => {
    setIsDropdownOpen(false);

    if (path === "/logout") {
      logout();
      navigate("/");
      return;
    }

    navigate(path);
  };

  return (
    <header className="bg-gray-600 w-full h-16 fixed top-0 z-50 flex items-center justify-between px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="Gupta General Store"
          className="h-12 w-auto"
        />
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex space-x-8 text-lg text-white">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link to="/products" className="hover:text-gray-300">
          Products
        </Link>
        <Link to="/contact" className="hover:text-gray-300">
          Contact
        </Link>
      </nav>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Cart */}
        <Link to="/cart" className="relative text-white text-2xl">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={userIcon}
            alt="User"
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="h-10 w-10 rounded-full cursor-pointer border-2 border-transparent hover:border-white"
          />

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              {/* User Info */}
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">
                  Welcome
                </p>
                <p className="text-xs text-gray-500">
                  {user?.name || "Guest"}
                </p>
              </div>

              <button
                onClick={() => handleMenuClick("/account")}
                className="dropdown-btn"
              >
                My Account
              </button>

              <button
                onClick={() => handleMenuClick("/orders")}
                className="dropdown-btn"
              >
                My Orders
              </button>

              <button
                onClick={() => handleMenuClick("/cart")}
                className="dropdown-btn"
              >
                Shopping Cart
              </button>

              <button
                onClick={() => handleMenuClick("/settings")}
                className="dropdown-btn"
              >
                Settings
              </button>

              <div className="border-t">
                {user ? (
                  <button
                    onClick={() => handleMenuClick("/logout")}
                    className="dropdown-btn text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => handleMenuClick("/login")}
                    className="dropdown-btn text-green-600 hover:bg-green-50"
                  >
                    Login
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
