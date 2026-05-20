import React, { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useUserStore } from "../../../stores/useUserStore";
import { productService } from "../../products/services/productService";
import { orderService } from "../../orders/services/orderService";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  // Fetch live product details
  useEffect(() => {
    if (!isCartOpen) return;

    const controller = new AbortController();

    const fetchLiveDetails = async () => {
      if (cartItems.length === 0) {
        setDetailedItems([]);
        return;
      }
      setLoading(true);
      try {
        const details = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const data = await productService.getProductById(item.productId, controller.signal);
              return { ...data.product, qty: item.qty, productId: item.productId };
            } catch (error) {
              if (error.name === "CanceledError" || error.name === "AbortError") return null;
              console.error(`Failed to fetch product ${item.productId}`, error);
              return null;
            }
          })
        );

        if (controller.signal.aborted) return;

        const activeDetails = details.filter(Boolean);
        setDetailedItems(activeDetails);

        const activeIds = activeDetails.map((d) => d._id);
        cartItems.forEach((item) => {
          if (!activeIds.includes(item.productId)) {
            removeFromCart(item.productId);
          }
        });
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        toast.error("Failed to load product details");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchLiveDetails();
    return () => controller.abort();
  }, [cartItems, isCartOpen]);

  const total = detailedItems.reduce(
    (sum, item) => sum + (item.newPrice || 0) * (item.qty || 0),
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to place an order");
      setIsCartOpen(false);
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all checkout fields");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.productId,
          qty: item.qty,
        })),
        shippingAddress,
        phoneNumber,
      };

      await orderService.placeOrder(orderData);

      toast.success("Order placed successfully!");
      clearCart();
      setShowCheckoutForm(false);
      setIsCartOpen(false);
      navigate("/orders");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to place order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Desktop: slide from right. Mobile: slide from bottom.
  const drawerVariants = {
    hidden: {
      x: typeof window !== "undefined" && window.innerWidth < 640 ? 0 : "100%",
      y: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 0,
    },
    visible: { x: 0, y: 0 },
    exit: {
      x: typeof window !== "undefined" && window.innerWidth < 640 ? 0 : "100%",
      y: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 0,
    },
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-[2px]"
          />

          {/* Drawer Panel — right on desktop, bottom sheet on mobile */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.35 }}
            className="fixed z-50 bg-white shadow-2xl flex flex-col
              inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-full sm:w-full sm:max-w-md sm:rounded-t-none sm:rounded-l-3xl sm:border-l sm:border-slate-100"
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                <h2 className="text-base font-bold text-slate-800">Your Basket</h2>
                {cartItems.length > 0 && (
                  <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading && detailedItems.length === 0 ? (
                <div className="space-y-3 py-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="h-14 w-14 rounded-xl shimmer shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded shimmer" />
                        <div className="h-3 w-1/3 rounded shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : detailedItems.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="font-bold text-slate-600 text-sm">Basket is empty</p>
                  <p className="text-xs text-slate-400 max-w-[200px]">
                    Add essentials from the store to get started.
                  </p>
                  <button
                    onClick={() => { setIsCartOpen(false); navigate("/products"); }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer mt-2"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {detailedItems.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover shrink-0 bg-white"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs truncate">{item.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">₹{item.newPrice} × {item.qty}</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <button
                            onClick={() => updateQuantity(item.productId, item.qty - 1)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 transition cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 select-none">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.qty + 1)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 transition cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-300 hover:text-red-500 transition cursor-pointer p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Checkout form */}
                  <AnimatePresence>
                    {showCheckoutForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        onSubmit={handlePlaceOrder}
                        className="overflow-hidden border-t border-slate-100 pt-4 mt-4 space-y-3"
                      >
                        <h3 className="font-bold text-xs text-slate-700">Delivery Info</h3>
                        <textarea
                          rows="2"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Full address, house no, landmark"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-green-500 transition"
                        />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Phone number"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-green-500 transition"
                        />
                        <button
                          type="submit"
                          disabled={isPlacingOrder}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {isPlacingOrder ? "Placing..." : "Confirm Order"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            {detailedItems.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Subtotal</p>
                    <p className="text-lg font-extrabold text-slate-900">₹{total}</p>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-red-400 hover:text-red-600 font-semibold cursor-pointer transition"
                  >
                    Clear all
                  </button>
                </div>

                {!showCheckoutForm ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to proceed");
                        setIsCartOpen(false);
                        navigate("/login", { state: { from: "/cart" } });
                        return;
                      }
                      setShowCheckoutForm(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    ← Back to items
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
