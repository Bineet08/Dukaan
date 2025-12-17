import React from "react";
import { useUserStore } from "../stores/useUserStore";

const Orders = () => {
    const user = useUserStore((state) => state.user);

    // 🔒 This page is already protected by ProtectedRoute
    // so user is guaranteed here, but we still code defensively
    if (!user) {
        return null;
    }

    // TEMP: placeholder orders (replace with backend later)
    const orders = user.orders || [];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-500">
                    You haven’t placed any orders yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold">
                                    Order #{order._id.slice(-6)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="text-sm text-gray-700 mb-2">
                                Items: {order.items.length}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-bold">
                                    Total: ₹{order.totalAmount}
                                </span>
                                <span
                                    className={`text-sm font-medium ${order.status === "Delivered"
                                            ? "text-green-600"
                                            : "text-orange-600"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
