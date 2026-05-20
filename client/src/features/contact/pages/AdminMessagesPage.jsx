import React, { useEffect, useState } from "react";
import { contactService } from "../services/contactService";
import { useUserStore } from "../../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminMessagesPage = () => {
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

        const controller = new AbortController();

        const fetchMessages = async () => {
            try {
                setLoading(true);

                const data = await contactService.getContactMessages(controller.signal);

                // handle both array & object response safely
                const messagesArray = Array.isArray(data)
                    ? data
                    : data.messages || [];

                setMessages(messagesArray);
            } catch (error) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchMessages();

        // FIX BUG-27: cancel in-flight request on unmount
        return () => controller.abort();
    }, [user]);

    /* =========================
       UI
       ========================= */
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600 animate-pulse">
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

export default AdminMessagesPage;
