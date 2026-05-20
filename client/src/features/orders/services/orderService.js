import axiosInstance from "../../../lib/axios";

export const orderService = {
    getMyOrders: async (signal) => {
        const { data } = await axiosInstance.get("/orders/my-orders", { signal });
        return data;
    },

    placeOrder: async (payload) => {
        const { data } = await axiosInstance.post("/orders", payload);
        return data;
    },

    getAllOrders: async (page, limit, signal) => {
        const { data } = await axiosInstance.get(`/orders?page=${page}&limit=${limit}`, { signal });
        return data;
    },

    updateOrderStatus: async (orderId, status) => {
        const { data } = await axiosInstance.put(`/orders/${orderId}/status`, { status });
        return data;
    }
};
