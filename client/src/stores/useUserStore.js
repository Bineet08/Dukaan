import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    // Hydrate safely when browser storage is unavailable or contains invalid JSON.
    user: (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch (error) {
            console.error("Unable to read saved user from browser storage:", error);
            return null;
        }
    })(),
    token: (() => {
        try {
            return localStorage.getItem("token");
        } catch (error) {
            console.error("Unable to read saved login token from browser storage:", error);
            return null;
        }
    })(),
    loading: false,

    // FIX BUG-14: single source of truth for persisting auth state.
    // register() and login() now both call setAuth() instead of
    // duplicating localStorage + set() logic independently.
    setAuth: (user, token) => {
        set({ user, token });
        try {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
        } catch (error) {
            console.error("Unable to persist login to browser storage:", error);
            for (const key of ["user", "token"]) {
                try {
                    localStorage.removeItem(key);
                } catch (cleanupError) {
                    console.error(`Unable to clear incomplete saved ${key}:`, cleanupError);
                }
            }
            toast.error("You are signed in, but this browser could not save your session.");
        }
    },

    clearAuth: () => {
        set({ user: null, token: null });
        let storageError = null;
        for (const key of ["user", "token"]) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                storageError = error;
                console.error(`Unable to remove saved ${key} from browser storage:`, error);
            }
        }
        if (storageError) {
            toast.error("Your session ended, but saved login data could not be fully cleared from this browser.");
        }
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

            // FIX BUG-14: use setAuth instead of duplicating state + localStorage logic
            get().setAuth(user, data.token);
            set({ loading: false });

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

            // FIX BUG-14: use setAuth instead of duplicating state + localStorage logic
            get().setAuth(user, data.token);
            set({ loading: false });

            toast.success("Login successful");
            return data;

        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Invalid credentials");
            throw error;
        }
    },

    logout: () => {
        get().clearAuth();
        toast.success("Logout successful");
    },
}));
