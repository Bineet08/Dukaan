import axiosInstance from "../../../lib/axios";

export const productService = {
    getProducts: async (params = {}, signal) => {
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
                urlParams.append(key, val);
            }
        });
        const query = urlParams.toString() ? `?${urlParams.toString()}` : "";
        const { data } = await axiosInstance.get(`/products${query}`, { signal });
        return data;
    },

    addProduct: async (payload) => {
        const { data } = await axiosInstance.post("/products/add", payload);
        return data;
    },

    updateProduct: async (id, payload) => {
        const { data } = await axiosInstance.put(`/products/${id}`, payload);
        return data;
    },

    deleteProduct: async (id) => {
        const { data } = await axiosInstance.delete(`/products/${id}`);
        return data;
    },

    getProductById: async (id, signal) => {
        const { data } = await axiosInstance.get(`/products/${id}`, { signal });
        return data;
    }
};
