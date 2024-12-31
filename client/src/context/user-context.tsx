import React, { createContext, useReducer } from "react";
import { userReducer, initialUserState, UserState, UserAction } from "../reducers/user-reducer.tsx";

// Définir le type du contexte
type UserContextType = {
    userState: UserState;
    dispatch: React.Dispatch<UserAction>;
};

// Créer le contexte
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Créer le provider
export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userState, dispatch] = useReducer(userReducer, initialUserState);

    return (
        <UserContext.Provider value={{ userState, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};
