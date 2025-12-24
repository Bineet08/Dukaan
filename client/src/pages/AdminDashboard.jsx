import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const AdminDashboard = () => {
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!user.isAdmin) {
            navigate("/");
        }
    }, [user, navigate]);

    const stats = [
        { title: "Total Products", value: "--", icon: "📦", color: "bg-blue-500" },
        { title: "Total Orders", value: "--", icon: "🛒", color: "bg-green-500" },
        { title: "Total Users", value: "--", icon: "👥", color: "bg-purple-500" },
        { title: "Revenue", value: "--", icon: "💰", color: "bg-yellow-500" },
    ];

    const quickActions = [
        { title: "Manage Products", path: "/admin/products", icon: "📝", description: "Add, edit, or delete products" },
        { title: "View Orders", path: "/admin/orders", icon: "📋", description: "Manage customer orders" },
        { title: "User Management", path: "/admin/users", icon: "👤", description: "Manage user accounts" },
        { title: "User Messages", path: "/admin/messages", icon: "✉️", description: "Messages from users" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.name || "Admin"}!
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
                            >
                                <div className="text-4xl mb-3">{action.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Recent Activity
                    </h2>
                    <div className="text-center py-8 text-gray-500">
                        No recent activity to display
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
