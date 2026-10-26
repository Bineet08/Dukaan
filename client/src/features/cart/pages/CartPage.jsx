import { useCart } from "../../../context/CartContext";
import { useUserStore } from "../../../stores/useUserStore";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { productService } from "../../products/services/productService";
import { orderService } from "../../orders/services/orderService";
import { ShoppingBag } from "lucide-react";
import { useDialogFocus } from "../../../hooks/useDialogFocus";

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();

    const [detailedItems, setDetailedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(new Set(cartItems.map((i) => i.productId)));

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const checkoutDialogRef = useDialogFocus(showCheckoutModal, () => setShowCheckoutModal(false));
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
    useEffect(() => {
        setSelected(new Set(cartItems.map((i) => i.productId)));
    },[cartItems]);

    const total = detailedItems.reduce(
        (sum, item) => {
            const isSelected = selected.has(item.productId);
            return sum + (isSelected ? 1 : 0) * (item.newPrice || 0) * (item.qty || 0);
        },
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
            const selectedItems = cartItems.filter((item) => selected.has(item.productId));
            if (selected.size === 0) {
                toast.error("Please select at least one item");
                return;
            }
            const orderData = {
                items: selectedItems.map((item) => ({
                    product: item.productId,
                    qty: item.qty,
                })),
                shippingAddress,
                phoneNumber,
            };

            await orderService.placeOrder(orderData);

            toast.success("Order placed successfully!");
            selectedItems.forEach((item) => removeFromCart(item.productId));
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

    const handleRemove = (productId) => {
        removeFromCart(productId);
        toast.success("Item removed from cart");
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
        });
    };

    // FIX BUG-11: check loading BEFORE empty-cart to prevent flash of
    // "Your cart is empty" while products are still being fetched
    if (loading && detailedItems.length === 0 && cartItems.length > 0) {
        return (
            <div role="status" aria-label="Loading cart items" className="max-w-3xl mx-auto px-4 py-8 space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4">
                        <div className="h-12 w-12 shrink-0 rounded-lg shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-2/3 rounded shimmer" />
                            <div className="h-3 w-1/3 rounded shimmer" />
                        </div>
                        <div className="h-10 w-20 rounded-lg shimmer" />
                    </div>
                ))}
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-xl mx-auto my-12 rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center shadow-soft">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <ShoppingBag className="h-8 w-8" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">Your cart is empty</h1>
                <p className="mt-2 text-sm text-slate-500">Browse the store and add your everyday essentials.</p>
                <Link
                    to="/products"
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-green-600 px-6 font-bold text-white transition hover:bg-green-700 focus-visible:outline-none"
                >
                    Start shopping
                </Link>
                <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
                    {[
                        ["Groceries", "grocery"],
                        ["Medicine", "medicine"],
                        ["Beauty", "beauty"],
                    ].map(([label, category]) => (
                        <Link
                            key={category}
                            to={`/products?category=${category}`}
                            className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:border-green-300 hover:text-green-700 focus-visible:outline-none"
                        >
                            Shop {label}
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

            {detailedItems.map((item) => (
                <div
                    key={item._id}
                    className="flex justify-between items-center border-b py-4">
                    <div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selected.has(item.productId)}
                            onChange={() => {
                                setSelected(prev => {
                                    const next = new Set(prev);

                                    if (next.has(item.productId)) {
                                        next.delete(item.productId);
                                    } else {
                                        next.add(item.productId);
                                    }

                                    return next;
                                });
                            }}
                        />
                        <h2 className="font-semibold">{item.name}</h2>
                    </div>
                        <p className="text-sm text-gray-500">
                            ₹{item.newPrice} × {item.qty}
                        </p>
                    </div>

                    <button
                        onClick={() => handleRemove(item.productId)}
                        className="min-h-12 px-3 text-red-500 hover:underline cursor-pointer"
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div className="mt-6 flex justify-between items-center">
                <span className="font-bold text-lg">Total: ₹{total}</span>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            clearCart();
                            toast.success("Cart cleared");
                        }}
                        className="min-h-12 bg-red-500 text-white px-4 rounded hover:bg-red-600 transition-colors cursor-pointer"
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
                        className="min-h-12 bg-green-600 text-white px-6 rounded hover:bg-green-700 transition-colors font-semibold cursor-pointer"
                    >
                        Place Order
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        ref={checkoutDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="checkout-dialog-title"
                        tabIndex={-1}
                        className="bg-white rounded-lg max-w-md w-full p-6"
                    >
                        <h2 id="checkout-dialog-title" className="text-2xl font-bold text-gray-800 mb-4">Checkout</h2>
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
                                    data-dialog-initial-focus
                                    aria-label="Shipping address"
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
                                    aria-label="Phone number"
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
                                    className="flex-1 min-h-12 bg-green-600 text-white px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isPlacingOrder ? "Placing Order..." : "Confirm Order"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    disabled={isPlacingOrder}
                                    className="flex-1 min-h-12 bg-gray-300 text-gray-700 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors cursor-pointer"
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
