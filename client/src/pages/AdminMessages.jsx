import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminMessages = () => {
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================
       AUTH GUARD
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
       FETCH CONTACT MESSAGES
       ========================= */
    useEffect(() => {
        if (!user?.isAdmin) return;

        const fetchMessages = async () => {
            try {
                setLoading(true);

                const { data } = await axiosInstance.get("/contact");

                // handle both array & object response safely
                const messagesArray = Array.isArray(data)
                    ? data
                    : data.messages || [];

                setMessages(messagesArray);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [user]);

    /* =========================
       UI
       ========================= */
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">
                Loading messages...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin – Contact Messages</h1>

            {messages.length === 0 ? (
                <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-500">
                    No messages received yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className="border rounded-lg p-4 shadow-sm bg-white"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {msg.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {msg.email}
                                    </p>
                                </div>

                                <span className="text-xs text-gray-500">
                                    {new Date(msg.createdAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </div>

                            <div className="text-gray-700 text-sm whitespace-pre-line">
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
