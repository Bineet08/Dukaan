import { useCart } from "../context/CartContext";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  if (!product) return null;

  const hasImage =
    typeof product.image === "string" && product.image.trim() !== "";

  const price = Number(product.newPrice) || 0;
  const originalPrice =
    product.originalPrice && Number(product.originalPrice) > price
      ? Number(product.originalPrice)
      : null;

  /* =========================
     BUY NOW HANDLER
     ========================= */
  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    addToCart(product);   // add item
    navigate("/cart");    // go to cart immediately
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col bg-white">
      {hasImage ? (
        <img
          src={product.image}
          alt={product.name || "Product image"}
          className="w-full h-40 object-cover mb-3 rounded"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 mb-3 flex items-center justify-center bg-gray-100 text-gray-400 rounded">
          No Image
        </div>
      )}

      <h2 className="font-semibold text-lg text-gray-800">
        {product.name || "Unnamed product"}
      </h2>

      <div className="mt-2 mb-4 flex items-center">
        <span className="text-green-600 font-bold text-lg">
          ₹{price}
        </span>

        {originalPrice && (
          <span className="ml-2 line-through text-gray-400 text-sm">
            ₹{originalPrice}
          </span>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => addToCart(product)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
