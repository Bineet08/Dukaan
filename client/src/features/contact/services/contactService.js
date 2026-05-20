import axiosInstance from "../../../lib/axios";

export const contactService = {
    sendContactMessage: async (payload) => {
        const { data } = await axiosInstance.post("/contact", payload);
        return data;
    },

    getContactMessages: async (signal) => {
        const { data } = await axiosInstance.get("/contact", { signal });
        return data;
    }
};
