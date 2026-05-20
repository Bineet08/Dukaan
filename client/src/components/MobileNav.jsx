import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCart } from "../context/CartContext";

const MobileNav = () => {
  const location = useLocation();
  const { cartItems, setIsCartOpen } = useCart();

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  const navItems = [
    { label: "Home", path: "/", icon: Home, action: null },
    { label: "Categories", path: "/products", icon: Grid, action: null },
    {
      label: "Cart",
      path: null,
      icon: ShoppingBag,
      action: () => setIsCartOpen(true),
      badge: cartCount,
    },
    { label: "Orders", path: "/orders", icon: ClipboardList, action: null },
    { label: "Account", path: "/account", icon: User, action: null },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2">
      {navItems.map((item, idx) => {
        const IconComponent = item.icon;
        const isActive = item.path ? location.pathname === item.path : false;

        const content = (
          <div className="flex flex-col items-center justify-center relative py-1 text-center min-w-12 select-none">
            <div className="relative">
              <IconComponent
                className={`h-5 w-5 transition-colors ${
                  isActive ? "text-green-600" : "text-slate-500"
                }`}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-green-600 text-white text-[9px] font-extrabold h-4.5 w-4.5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 font-semibold transition-colors ${
                isActive ? "text-green-600" : "text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </div>
        );

        if (item.action) {
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex-1 focus:outline-none flex justify-center cursor-pointer"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={idx}
            to={item.path}
            className="flex-1 flex justify-center"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;
