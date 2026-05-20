import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { orderService } from "../services/orderService";
import { useUserStore } from "../../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../../lib/errorHandler";
import { ORDERS_PER_PAGE } from "../../../constants";

const AdminOrdersPage = () => {
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
    const fetchOrders = async (pageNo = 1, signal) => {
        try {
            setLoading(true);

            const data = await orderService.getAllOrders(pageNo, ORDERS_PER_PAGE, signal);

            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
            setTotalOrders(data.totalOrders || 0);

        } catch (err) {
            if (err.name === "CanceledError" || err.name === "AbortError") {
                return;
            }
            handleApiError(err, "Failed to fetch orders");
        } finally {
            if (!signal || !signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) return;

        const controller = new AbortController();
        fetchOrders(page, controller.signal);

        return () => {
            controller.abort();
        };
    }, [user, page]);

    /* =========================
       UPDATE ORDER STATUS
       ========================= */
    const handleStatusUpdate = async (orderId, status) => {
        const previousOrders = orders;
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));

        try {
            await orderService.updateOrderStatus(orderId, status);
            toast.success("Order status updated");
        } catch (err) {
            setOrders(previousOrders);
            handleApiError(err, "Failed to update order");
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
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-t border-slate-100">
                                    <td className="p-3"><div className="h-5 w-20 rounded shimmer" /></td>
                                    <td className="p-3">
                                        <div className="h-5 w-28 rounded shimmer mb-1" />
                                        <div className="h-3.5 w-36 rounded shimmer" />
                                    </td>
                                    <td className="p-3">
                                        <div className="h-4 w-24 rounded shimmer mb-1" />
                                        <div className="h-4 w-16 rounded shimmer" />
                                    </td>
                                    <td className="p-3 font-semibold"><div className="h-5 w-16 rounded shimmer" /></td>
                                    <td className="p-3"><div className="h-5 w-24 rounded shimmer" /></td>
                                    <td className="p-3">
                                        <div className="h-6 w-20 rounded-full shimmer" />
                                    </td>
                                    <td className="p-3">
                                        <div className="h-8 w-28 rounded shimmer" />
                                    </td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-6 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
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
                                            className="border rounded px-2 py-1 bg-white cursor-pointer"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages} ({totalOrders} orders)
                    </span>
                    <div className="space-x-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
