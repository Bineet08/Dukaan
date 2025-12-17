import { useCart } from "../context/CartContext";

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const total = cartItems.reduce(
        (sum, item) => sum + item.newPrice * item.qty,
        0
    );

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                Your cart is empty.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

            {cartItems.map((item) => (
                <div
                    key={item._id}
                    className="flex justify-between items-center border-b py-4"
                >
                    <div>
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-sm text-gray-500">
                            ₹{item.newPrice} × {item.qty}
                        </p>
                    </div>

                    <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:underline"
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div className="mt-6 flex justify-between items-center">
                <span className="font-bold text-lg">Total: ₹{total}</span>

                <button
                    onClick={clearCart}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Clear Cart
                </button>
            </div>
        </div>
    );
};

export default Cart;
