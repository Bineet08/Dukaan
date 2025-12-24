import { useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

const Settings = () => {
    const { user, token, setAuth } = useUserStore();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axiosInstance.put("/auth/profile", {
                name,
                email,
            });

            // ✅ keep token, update user cleanly
            setAuth(
                {
                    id: data._id,
                    name: data.name,
                    email: data.email,
                    isAdmin: data.isAdmin,
                },
                token
            );

            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded text-white font-semibold ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Security */}
            <div className="mt-8 bg-gray-50 border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Security</h2>
                <p className="text-sm text-gray-600 mb-3">
                    Password change and advanced security settings will be available soon.
                </p>
                <button
                    disabled
                    className="px-4 py-2 text-sm rounded bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                    Change Password (Coming Soon)
                </button>
            </div>
        </div>
    );
};

export default Settings;
