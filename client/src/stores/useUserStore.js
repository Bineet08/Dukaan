import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
    // 🔐 hydrate safely
    user: (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    })(),
    token: localStorage.getItem("token"),
    loading: false,

    setAuth: (user, token) => {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        set({ user, token });
    },

    clearAuth: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        set({ user: null, token: null });
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

            const user = {
                id: data._id,
                email: data.email,
                name: data.name,
                isAdmin: data.isAdmin,
            };

            set((state) => ({
                ...state,
                loading: false,
                user,
                token: data.token,
            }));

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", data.token);

            toast.success("Signup successful");
            return data;

        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Signup failed");
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

            const user = {
                id: data._id,
                email: data.email,
                name: data.name,
                isAdmin: data.isAdmin,
            };

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", data.token);

            set({
                user,
                token: data.token,
                loading: false,
            });

            toast.success("Login successful");
            return data;

        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Invalid credentials");
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        set({ user: null, token: null });
        toast.success("Logout successful");
    },
}));
