import "./profile.css";
import React, { useContext } from "react";
import { UserContext } from "../context/user-context";

const ProfilePage: React.FC = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }

    const { state, dispatch } = userContext;

    const handleUpdateUser = () => {
        dispatch({
            type: "RESET_USER",
        });
    };

    const handleChangeTheme = () => {
        dispatch({
            type: 'CHANGE_THEME',
        });
    };


    return (
        <div className="page profile-container">
            <h2>Profile Page</h2>
            <p>Name: {state.name}</p>
            <p>Email: {state.email}</p>
            <p>Level: {state.level}</p>
            <button onClick={handleChangeTheme}>
                Switch to {state.theme === 'Dark' ? 'Light' : 'Dark'} Theme
            </button>
            <button onClick={handleUpdateUser}>Logout</button>
        </div>
    );
};

export default ProfilePage;
