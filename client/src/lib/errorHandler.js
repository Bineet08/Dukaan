import { toast } from "react-hot-toast";

/**
 * Handles API errors by formatting messages, ignoring cancellation tokens,
 * and displaying error toast alerts.
 * 
 * @param {Error} error The Axios / HTTP request error object.
 * @param {string} defaultMessage Fallback message if server error detail is missing.
 * @returns {string} The formatted error message.
 */
export const handleApiError = (error, defaultMessage = "Something went wrong") => {
    if (
        error?.name === "CanceledError" || 
        error?.name === "AbortError" || 
        error?.code === "ERR_CANCELED"
    ) {
        return "";
    }

    const message = 
        error?.response?.data?.error || 
        error?.response?.data?.message || 
        error?.message || 
        defaultMessage;

    toast.error(message);
    console.error("API Error encountered:", error);
    return message;
};
