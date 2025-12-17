import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const hasImage =
    product.image && product.image.trim() !== "";

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col">
      {hasImage ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover mb-3"
        />
      ) : (
        <div className="w-full h-40 mb-3 flex items-center justify-center bg-gray-100 text-gray-400">
          No Image
        </div>
      )}

      <h2 className="font-semibold text-lg">{product.name}</h2>

      <div className="mt-2 mb-4">
        <span className="text-green-600 font-bold">
          ₹{product.newPrice}
        </span>

        {product.originalPrice && (
          <span className="ml-2 line-through text-gray-400">
            ₹{product.originalPrice}
          </span>
        )}
      </div>

      {// Add to Cart button 
      }
      <button
        onClick={() => addToCart(product)}
        className="mt-auto bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
