import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import userIcon from "../assets/user.png";
import { useCart } from "../context/CartContext";
import { useUserStore } from "../stores/useUserStore";
import { Search, ShoppingBag, User, LogOut, Settings, ClipboardList, ShieldAlert, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [searchParams] = useSearchParams();

  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  // Sync search input with URL search param
  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
  }, [searchParams]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate("/products");
    }
  };

  // FIX BUG-25: debounce search navigation so we don't fire an API call per keystroke
  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/products?search=${encodeURIComponent(val.trim())}`);
      } else {
        navigate("/products");
      }
    }, 300);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="Gupta General Store"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Center: Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-lg md:max-w-xl relative group"
        >
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search groceries, medicines, beauty..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all shadow-soft"
          />
        </form>

        {/* Right Nav Links & Actions */}
        <div className="flex items-center space-x-5 shrink-0">
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-green-600 transition">Home</Link>
            <Link to="/products" className="hover:text-green-600 transition">Products</Link>
            <Link to="/contact" className="hover:text-green-600 transition">Contact</Link>
          </nav>

          <span className="hidden lg:inline h-4 w-px bg-slate-200" />

          {/* Cart Icon with animated badge */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-700 hover:text-green-600 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-center"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-extrabold h-4 w-4 flex items-center justify-center rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Account Menu */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDropdownOpen((p) => !p)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
            >
              <img
                src={userIcon}
                alt="User"
                className="h-7 w-7 rounded-full object-cover"
              />
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block"
              >
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </motion.div>
            </motion.button>

            {/* Animated dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-premium py-1.5 origin-top-right"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Account Profile
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.name || "Guest User"}
                    </p>
                  </div>

                  {user ? (
                    <>
                      <button
                        onClick={() => handleMenuClick("/account")}
                        className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <User className="h-4 w-4" /> My Account
                      </button>

                      <button
                        onClick={() => handleMenuClick("/orders")}
                        className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <ClipboardList className="h-4 w-4" /> My Orders
                      </button>

                      <button
                        onClick={() => handleMenuClick("/settings")}
                        className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </button>

                      {user.isAdmin && (
                        <button
                          onClick={() => handleMenuClick("/admin/dashboard")}
                          className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50/50 border-t border-slate-100 transition cursor-pointer font-medium"
                        >
                          <ShieldAlert className="h-4 w-4" /> Admin Panel
                        </button>
                      )}

                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={() => handleMenuClick("/logout")}
                          className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleMenuClick("/login")}
                      className="dropdown-btn flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition cursor-pointer font-semibold"
                    >
                      <User className="h-4 w-4" /> Login / Sign Up
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
