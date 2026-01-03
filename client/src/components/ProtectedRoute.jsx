import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Center py="xl">
                <Loader />
            </Center>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
