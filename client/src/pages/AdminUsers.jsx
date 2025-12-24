import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const USERS_PER_PAGE = 10;

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
    const fetchUsers = async (pageNo = 1) => {
        try {
            setLoading(true);

            const { data } = await axiosInstance.get(
                `/auth?page=${pageNo}&limit=${USERS_PER_PAGE}`
            );

            setUsers(data.users || data); // supports both paginated & flat response
            setTotalPages(data.totalPages || 1);
            setPage(pageNo);

        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, []);

    /* =========================
       TOGGLE ADMIN STATUS
       ========================= */
    const toggleAdmin = async (targetUser) => {
        if (targetUser._id === user.id) {
            toast.error("You cannot modify your own admin status");
            return;
        }

        try {
            await axiosInstance.put(`/auth/${targetUser._id}`, {
                isAdmin: !targetUser.isAdmin
            });

            toast.success("User updated");
            fetchUsers(page);

        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    /* =========================
       DELETE USER
       ========================= */
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await axiosInstance.delete(`/auth/${userId}`);
            toast.success("User deleted");
            fetchUsers(page);

        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">
                Loading users...
            </div>
        );
    }

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
                        {users.map((u) => (
                            <tr key={u._id} className="border-t">
                                <td className="p-3">{u.name}</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3 text-center">
                                    {u.isAdmin ? "✅" : "❌"}
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => toggleAdmin(u)}
                                        className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        {u.isAdmin ? "Remove Admin" : "Make Admin"}
                                    </button>

                                    <button
                                        onClick={() => deleteUser(u._id)}
                                        className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => fetchUsers(page - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="px-4 py-1">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => fetchUsers(page + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
