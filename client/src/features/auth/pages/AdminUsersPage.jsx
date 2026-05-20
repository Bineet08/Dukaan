import React, { useEffect, useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { handleApiError } from "../../../lib/errorHandler";
import { USERS_PER_PAGE } from "../../../constants";

const AdminUsersPage = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* =========================
       AUTH GUARD (FRONTEND)
       ========================= */
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!user.isAdmin) {
            toast.error("Admin access required");
            navigate("/");
            return;
        }
    }, [user, navigate]);

    /* =========================
       FETCH USERS
       ========================= */
    const fetchUsers = async (pageNo = 1, signal) => {
        try {
            setLoading(true);

            const data = await authService.getUsers(pageNo, USERS_PER_PAGE, signal);

            setUsers(data.users || data); // supports both paginated & flat response
            setTotalPages(data.totalPages || 1);

        } catch (err) {
            if (err.name === "CanceledError" || err.name === "AbortError") {
                return;
            }
            handleApiError(err, "Failed to load users");
        } finally {
            if (!signal || !signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) return;

        const controller = new AbortController();
        fetchUsers(page, controller.signal);

        return () => {
            controller.abort();
        };
    }, [user, page]);

    /* =========================
       TOGGLE ADMIN STATUS
       ========================= */
    const toggleAdmin = async (targetUser) => {
        if (targetUser._id === user.id) {
            toast.error("You cannot modify your own admin status");
            return;
        }

        const previousUsers = users;
        setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, isAdmin: !u.isAdmin } : u));

        try {
            await authService.toggleAdminStatus(targetUser._id, !targetUser.isAdmin);
            toast.success("User updated");

        } catch (err) {
            setUsers(previousUsers);
            handleApiError(err, "Failed to update user");
        }
    };

    /* =========================
       DELETE USER
       ========================= */
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        const previousUsers = users;
        setUsers(prev => prev.filter(u => u._id !== userId));

        try {
            await authService.deleteUser(userId);
            toast.success("User deleted");

        } catch (err) {
            setUsers(previousUsers);
            handleApiError(err, "Failed to delete user");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin – Users</h1>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-center">Admin</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-t border-slate-100">
                                    <td className="p-3">
                                        <div className="h-5 w-24 rounded shimmer" />
                                    </td>
                                    <td className="p-3">
                                        <div className="h-5 w-40 rounded shimmer" />
                                    </td>
                                    <td className="p-3">
                                        <div className="h-5 w-8 rounded shimmer mx-auto" />
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="h-8 w-28 rounded shimmer mx-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u._id} className="border-t">
                                    <td className="p-3">{u.name}</td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3 text-center">
                                        {u.isAdmin ? "✅" : "❌"}
                                    </td>
                                    <td className="p-3 text-center space-x-2">
                                        <button
                                            onClick={() => toggleAdmin(u)}
                                            className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                        >
                                            {u.isAdmin ? "Remove Admin" : "Make Admin"}
                                        </button>

                                        <button
                                            onClick={() => deleteUser(u._id)}
                                            className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                    >
                        Prev
                    </button>

                    <span className="px-4 py-1">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
