import axiosInstance from "../../../lib/axios";

export const authService = {
    login: async (email, password) => {
        const { data } = await axiosInstance.post("/auth/login", { email, password });
        return data;
    },

    register: async (name, email, password) => {
        const { data } = await axiosInstance.post("/auth/register", { name, email, password });
        return data;
    },

    getUsers: async (page, limit, signal) => {
        // FIX BUG-29: server route is GET /api/auth/ not /api/auth/users
        const { data } = await axiosInstance.get(`/auth?page=${page}&limit=${limit}`, { signal });
        return data;
    },

    // FIX BUG-22: AdminDashboardPage calls getAllUsers — alias for getUsers with high limit
    getAllUsers: async (signal) => {
        const { data } = await axiosInstance.get(`/auth?limit=100`, { signal });
        return data;
    },

    toggleAdminStatus: async (userId, isAdmin) => {
        const { data } = await axiosInstance.put(`/auth/${userId}`, { isAdmin });
        return data;
    },

    deleteUser: async (userId) => {
        const { data } = await axiosInstance.delete(`/auth/${userId}`);
        return data;
    },

    updateProfile: async (payload) => {
        const { data } = await axiosInstance.put("/auth/profile", payload);
        return data;
    }
};
