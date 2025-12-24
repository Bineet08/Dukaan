import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const AdminRoute = ({ children }) => {
    const user = useUserStore((state) => state.user);
    const location = useLocation();

    if (!user) {
        // User not logged in
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!user.isAdmin) {
        // User is not admin
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};

export default AdminRoute;
