import axios from "axios";
import { useUserStore } from "../stores/useUserStore";
import { globalNavigate } from "./navigation";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false,
    timeout: 10000,
});

// 🔐 Attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Handle auth failure
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useUserStore.getState().clearAuth();

            if (!window.location.pathname.includes("/login")) {
                globalNavigate("/login");
            }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
