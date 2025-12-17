import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const ProtectedRoute = ({ children }) => {
    const user = useUserStore((state) => state.user);
    const location = useLocation();

    if (!user) {
        // remember where user wanted to go
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return children;
};

export default ProtectedRoute;
