import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const Orders = () => {
    const user = useUserStore((state) => state.user);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================
       FETCH USER ORDERS
       ========================= */
    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                setLoading(true);

                const { data } = await axiosInstance.get("/orders/my-orders");

                const ordersArray = Array.isArray(data)
                    ? data
                    : data.orders || [];

                setOrders(ordersArray);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);


    if (!user) {
        return null; // route already protected
    }

    /* =========================
       STATUS COLOR HELPER
       ========================= */
    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "text-green-600 bg-green-50";
            case "Shipped":
                return "text-blue-600 bg-blue-50";
            case "Processing":
                return "text-yellow-600 bg-yellow-50";
            case "Cancelled":
                return "text-red-600 bg-red-50";
            default:
                return "text-orange-600 bg-orange-50";
        }
    };

    /* =========================
       UI
       ========================= */
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-gray-600">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-500">
                    You haven't placed any orders yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border rounded-lg p-4 shadow-sm bg-white"
                        >
                            {/* Header */}
                            <div className="flex justify-between mb-3">
                                <span className="font-semibold text-lg">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    Items
                                </h3>
                                <div className="space-y-1">
                                    {order.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="text-sm text-gray-600 flex justify-between"
                                        >
                                            <span>
                                                {item.name} × {item.qty}
                                            </span>
                                            <span>
                                                ₹{item.price * item.qty}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping */}
                            {order.shippingAddress && (
                                <div className="mb-2 text-sm">
                                    <span className="font-semibold text-gray-700">
                                        Address:
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                        {order.shippingAddress}
                                    </span>
                                </div>
                            )}

                            {order.phoneNumber && (
                                <div className="mb-3 text-sm">
                                    <span className="font-semibold text-gray-700">
                                        Phone:
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                        {order.phoneNumber}
                                    </span>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="font-bold text-lg">
                                    Total: ₹{order.totalAmount}
                                </span>
                                <span
                                    className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                        order.status
                                    )}`}
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
