import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
    // 🔥 hydrate from localStorage
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,

    setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
    },

    register: async (name, email, password, confirmPassword) => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            throw new Error("Passwords do not match");
        }

        try {
            set({ loading: true });

            const { data } = await axiosInstance.post("/auth/register", {
                name,
                email,
                password,
            });

            localStorage.setItem("user", JSON.stringify(data));
            set({ user: data, loading: false });
            toast.success("Signup successful");
            return data;
        } catch (error) {
            set({ loading: false });
            toast.error(
                error.response?.data?.message || "Signup failed"
            );
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            set({ loading: true });

            const { data } = await axiosInstance.post("/auth/login", {
                email,
                password,
            });

            // 🔥 persist user
            localStorage.setItem("user", JSON.stringify(data));
            set({ user: data, loading: false });
            toast.success("Login successful");
            return data;
        } catch (error) {
            set({ loading: false });
            toast.error(
                error.response?.data?.message || "Invalid credentials"
            );
            throw error;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout"); // optional
        } catch (_) { }

        localStorage.removeItem("user");
        set({ user: null });
        toast.success("Logout successful");
    },
}));
