import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";

const ORDERS_PER_PAGE = 10;

const AdminOrders = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    /* =========================
       FRONTEND ADMIN GUARD
       ========================= */
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!user.isAdmin) {
            toast.error("Admin access required");
            navigate("/");
        }
    }, [user, navigate]);

    /* =========================
       FETCH ORDERS
       ========================= */
    const fetchOrders = async (pageNo = 1) => {
        try {
            setLoading(true);

            const { data } = await axiosInstance.get(
                `/orders?page=${pageNo}&limit=${ORDERS_PER_PAGE}`
            );

            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
            setTotalOrders(data.totalOrders || 0);
            setPage(pageNo);

        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, []);

    /* =========================
       UPDATE ORDER STATUS
       ========================= */
    const handleStatusUpdate = async (orderId, status) => {
        try {
            await axiosInstance.put(`/orders/${orderId}/status`, { status });
            toast.success("Order status updated");
            fetchOrders(page);
        } catch (error) {
            toast.error("Failed to update order");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-800";
            case "Shipped":
                return "bg-blue-100 text-blue-800";
            case "Processing":
                return "bg-yellow-100 text-yellow-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-orange-100 text-orange-800";
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">
                Loading orders...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin – Orders</h1>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Order</th>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Items</th>
                            <th className="p-3 text-left">Total</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="border-t">
                                <td className="p-3">#{order._id.slice(-8).toUpperCase()}</td>
                                <td className="p-3">
                                    <div>{order.user?.name || "N/A"}</div>
                                    <div className="text-xs text-gray-500">
                                        {order.user?.email || ""}
                                    </div>
                                </td>
                                <td className="p-3">
                                    {(order.items || []).map((item, i) => (
                                        <div key={i} className="text-xs">
                                            {item.name} × {item.qty}
                                        </div>
                                    ))}
                                </td>
                                <td className="p-3 font-semibold">₹{order.totalAmount}</td>
                                <td className="p-3">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            handleStatusUpdate(order._id, e.target.value)
                                        }
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        No orders found
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages} ({totalOrders} orders)
                    </span>
                    <div className="space-x-2">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchOrders(page - 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchOrders(page + 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
