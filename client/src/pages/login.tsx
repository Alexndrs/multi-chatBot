import "./login.css";
import React, { useContext, useState } from "react";
import { UserContext } from "../context/user-context";
import { useNavigate } from "react-router-dom";
import { serverAPI } from "../api/api.ts";
import bcrypt from "bcryptjs";
import CryptoJS from 'crypto-js';

const hashPasswordDeterministically = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

const LoginPage: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }

    const { dispatch } = userContext;
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form[0] as HTMLInputElement).value;
        const password = (form[1] as HTMLInputElement).value;
        const firstHash = hashPasswordDeterministically(password);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mail: email,
                password: firstHash
            }),
        }
        const response = await fetch(serverAPI + "user/login", options);
        const userInfo = await response.json();
        dispatch({
            type: "UPDATE_USER",
            payload: {
                email: userInfo.mail,
                token: userInfo.id,
                convInfos: userInfo.convInfos,
                theme: "Dark"
            },
        });

        navigate("/", { replace: true });
    }



    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form[0] as HTMLInputElement).value;
        const password = (form[1] as HTMLInputElement).value;
        const firstHash = hashPasswordDeterministically(password);
        const hashedPassword = await bcrypt.hash(firstHash, 10);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mail: email,
                hashedPassword: hashedPassword
            }),
        }
        const response = await fetch(serverAPI + "user/add", options);
        if (!response.ok) {
            console.log("Error while adding");
        }
        const token = await response.json();
        console.log("token : ", token);
        dispatch({
            type: "UPDATE_USER",
            payload: {
                email: email,
                token: token,
                convInfos: [],
                theme: "Dark"
            },
        });

        navigate("/", { replace: true });
    }

    return (
        <div className="auth-container">
            <div className={`auth-wrapper ${isLoginMode ? '' : 'show-register'}`}>
                {/* Panneau de fond qui se déplace */}
                <div className="colored-panel">
                    <div className="panel-content">
                        <h3>{isLoginMode ? 'New Here ?' : 'Already used to here?'}</h3>
                        <p>{isLoginMode ? 'Sign-up to discover this chatBot' : 'Sign-in to continue chatting'}</p>
                        <button
                            className="ghost-button"
                            onClick={() => setIsLoginMode(!isLoginMode)}
                        >
                            {isLoginMode ? "Sign-Up" : "Sign-In"}
                        </button>
                    </div>
                </div>

                <div className="form-container login-container">
                    <form onSubmit={handleLogin}>
                        <h2>Login</h2>
                        <div className="form-group">
                            <input type="email" placeholder="Email" />
                        </div>
                        <div className="form-group">
                            <input type="password" placeholder="Mot de passe" />
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>

                <div className="form-container register-container">
                    <form onSubmit={handleRegister}>
                        <h2>Register</h2>
                        <div className="form-group">
                            <input type="email" placeholder="Email" />
                        </div>
                        <div className="form-group">
                            <input type="password" placeholder="Password" />
                        </div>
                        <button type="submit">Create Account</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
