import React, { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useUserStore } from "../../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Heart, Star, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const hasImage = typeof product.image === "string" && product.image.trim() !== "";
  const price = Number(product.newPrice) || 0;
  const originalPrice = product.originalPrice && Number(product.originalPrice) > price
    ? Number(product.originalPrice)
    : null;

  // Calculate discount percentage
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Find if this product is in the cart
  const cartItem = cartItems.find((item) => item.productId === product._id);
  const cartQty = cartItem ? cartItem.qty : 0;

  // Compute a deterministic rating based on product ID
  const rating = ((product._id.toString().charCodeAt(0) % 7) * 0.1 + 4.2).toFixed(1);

  // Helper to parse weight/size from product name or default
  const getWeightLabel = (name) => {
    const match = name.match(/\d+\s*(g|kg|ml|l|L|pcs|Pcs|pack|Pack|tab|tabs|Tablet|tablets)\b/i);
    return match ? match[0] : "1 unit";
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    if (!isWishlisted) {
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl border border-slate-100/90 shadow-card hover:shadow-soft flex flex-col p-3 relative overflow-hidden transition-shadow"
    >
      {/* Top badges & Wishlist */}
      <div className="relative w-full aspect-square rounded-xl bg-slate-50/50 overflow-hidden mb-3.5 group">
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-green-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg z-10 shadow-soft">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Icon */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 rounded-full shadow-soft z-10 transition duration-200 cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>

        {/* Product Image */}
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            No Image
          </div>
        )}
      </div>

      {/* Middle info */}
      <div className="flex-1 flex flex-col">
        {/* Rating Badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className="bg-slate-50 border border-slate-100 rounded-lg px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] font-bold text-slate-600">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {getWeightLabel(product.name)}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>
      </div>

      {/* Bottom price and Blinkit quantity selection */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-slate-900 font-extrabold text-sm">
            ₹{price}
          </span>
          {originalPrice && (
            <span className="line-through text-slate-400 text-[10px] font-medium -mt-0.5">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Blinkit quantity action buttons */}
        <div className="w-20 h-9 shrink-0 flex items-center justify-center">
          {cartQty > 0 ? (
            <div className="w-full h-full flex items-center justify-between bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-soft px-1.5 overflow-hidden transition select-none">
              <button
                onClick={() => updateQuantity(product._id, cartQty - 1)}
                className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-extrabold">{cartQty}</span>
              <button
                onClick={() => updateQuantity(product._id, cartQty + 1)}
                className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="w-full h-full bg-white hover:bg-green-50 border border-green-200 text-green-700 font-extrabold text-xs rounded-xl shadow-soft transition cursor-pointer flex items-center justify-center gap-0.5 hover:border-green-300"
            >
              <Plus className="h-3 w-3 text-green-700 font-bold" />
              ADD
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
