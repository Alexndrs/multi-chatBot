import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/user-context";

const PrivateRoute = () => {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }
    const { state } = userContext;

    if (!state.token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // Affiche les composants enfants si l'utilisateur est authentifié
};

export default PrivateRoute;