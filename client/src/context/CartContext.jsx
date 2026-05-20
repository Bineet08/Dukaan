import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Hydrate cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => {
    // FIX BUG-19: wrap in try/catch — corrupted localStorage would crash the app
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Slide-out Drawer Visibility State
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const productId = product._id || product.productId || product;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);

      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { productId, qty: 1 }];
    });
  };

  const updateQuantity = (productId, qty) => {
    setCartItems((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId
          ? { ...item, qty }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
