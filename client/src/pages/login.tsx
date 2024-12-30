import "./login.css";
import React, { useContext } from "react";
import { UserContext } from "../context/user-context";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }

    const { dispatch } = userContext;
    const navigate = useNavigate();

    const handleUpdateUser = () => {
        dispatch({
            type: "UPDATE_USER",
            payload: {
                name: "John Doe",
                profilePic: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/John_Doe%2C_born_John_Nommensen_Duchac.jpg/1200px-John_Doe%2C_born_John_Nommensen_Duchac.jpg",
                level: 10,
                email: "johndoe@example.com",
                isConnected: true,
                theme: "Dark"
            },
        });

        navigate("/", { replace: true });
    };

    return (
        <div className="login-container">
            <button onClick={handleUpdateUser}>Login</button>
        </div>
    );
};

export default LoginPage;
