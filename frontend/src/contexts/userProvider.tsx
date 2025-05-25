import React, { useState } from 'react';
import { UserContext } from './userContext';
import type { UserData } from './userContext';

interface Props {
    children: React.ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [userData, setUserData] = useState<UserData | null>(null);

    return (
        <UserContext.Provider value={{ UserData: userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};
