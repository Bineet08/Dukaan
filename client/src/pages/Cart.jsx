import { useCart } from "../context/CartContext";
import { useUserStore } from "../stores/useUserStore";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const total = cartItems.reduce(
        (sum, item) => sum + item.newPrice * item.qty,
        0
    );

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to place an order");
            navigate("/login");
            return;
        }

        setIsPlacingOrder(true);

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    qty: item.qty,
                    price: item.newPrice
                })),
                totalAmount: total,
                shippingAddress,
                phoneNumber
            };

            const response = await fetch(`${backendUrl}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Order placed successfully!");
                clearCart();
                setShowCheckoutModal(false);
                navigate("/orders");
            } else {
                toast.error(data.error || "Failed to place order");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place order");
        } finally {
            setIsPlacingOrder(false);
        }
    };

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

                <div className="flex gap-3">
                    <button
                        onClick={clearCart}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Clear Cart
                    </button>
                    <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
                    >
                        Place Order
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h2>
                        <form onSubmit={handlePlaceOrder}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Shipping Address *
                                </label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    required
                                    placeholder="Enter your complete shipping address"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="bg-gray-50 p-3 rounded mb-6">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Items:</span>
                                    <span>{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount:</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isPlacingOrder}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPlacingOrder ? "Placing Order..." : "Confirm Order"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    disabled={isPlacingOrder}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
