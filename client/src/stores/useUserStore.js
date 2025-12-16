import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    setUser: (user) => set({ user }),

    register: async (name, email, password, confirmPassword) => {
        set({ loading: true });
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const response = await axiosInstance.post("/auth/register", { name, email, password });

            if (response.data.error) {
                toast.error(response.data.error);
                return;
            }
            set({ user: response.data, loading: false });
            toast.success("Signup successful");
        } catch (error) {
            toast.error("Signup failed");
        }
    },

    login: async (email, password) => {
        try {
            const response = await axiosInstance.post("/login", { email, password });
            set({ user: response.data });
            toast.success("Login successful");
        } catch (error) {

        }
    },
    logout: () => {
        set({ user: null });
        toast.success("Logout successful");
    },
}));