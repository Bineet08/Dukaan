import axios from "axios";

const axiosInstance = axios.create({
    baseURL:
        import.meta.env.MODE === "development"
            ? "http://localhost:5000/api"
            : "/api",
    withCredentials: false // JWT is in header, not cookies
});

// 🔐 Attach JWT token to every request
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


// 🚨 Handle expired / invalid token globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            // Avoid infinite redirect loop
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
