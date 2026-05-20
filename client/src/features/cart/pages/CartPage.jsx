import { useCart } from "../../../context/CartContext";
import { useUserStore } from "../../../stores/useUserStore";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { productService } from "../../products/services/productService";
import { orderService } from "../../orders/services/orderService";

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();

    const [detailedItems, setDetailedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Fetch live product details for cart items
    useEffect(() => {
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
                            // FIX BUG-01: carry productId explicitly so remove/update
                            // always uses the ID that CartContext stores, not item._id
                            return { ...data.product, qty: item.qty, productId: item.productId };
                        } catch (error) {
                            if (error.name === "CanceledError" || error.name === "AbortError") {
                                return null;
                            }
                            console.error(`Failed to fetch product ${item.productId}`, error);
                            return null;
                        }
                    })
                );

                if (controller.signal.aborted) return;

                const activeDetails = details.filter(Boolean);
                setDetailedItems(activeDetails);

                // Synchronize and prune deleted/deactivated products
                const activeIds = activeDetails.map((d) => d._id);
                cartItems.forEach((item) => {
                    if (!activeIds.includes(item.productId)) {
                        removeFromCart(item.productId);
                    }
                });
            } catch (error) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                console.error("Cart hydration error:", error);
                toast.error("Failed to load product details");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchLiveDetails();
        return () => {
            controller.abort();
        };
    }, [cartItems]);

    const total = detailedItems.reduce(
        (sum, item) => sum + (item.newPrice || 0) * (item.qty || 0),
        0
    );

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to place an order");
            navigate("/login", { state: { from: "/cart" } });
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
            setShowCheckoutModal(false);
            navigate("/orders");
        } catch (error) {
            console.error("PLACE ORDER ERROR:", error);
            toast.error(
                error.response?.data?.error || "Failed to place order"
            );
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // FIX BUG-11: check loading BEFORE empty-cart to prevent flash of
    // "Your cart is empty" while products are still being fetched
    if (loading && detailedItems.length === 0 && cartItems.length > 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                Loading cart items...
            </div>
        );
    }

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

            {detailedItems.map((item) => (
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
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:underline cursor-pointer"
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
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        Clear Cart
                    </button>
                    <button
                        onClick={() => {
                            if (!user) {
                                toast.error("Please login to place an order");
                                navigate("/login", { state: { from: "/cart" } });
                                return;
                            }
                            setShowCheckoutModal(true);
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors font-semibold cursor-pointer"
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
                                    <span>{detailedItems.length}</span>
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
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isPlacingOrder ? "Placing Order..." : "Confirm Order"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    disabled={isPlacingOrder}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors cursor-pointer"
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

export default CartPage;
