import React, { useState } from 'react';
import { UserContext } from './userContext';
import type { UserData } from './userContext';

interface Props {
    children: React.ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    return (
        <UserContext.Provider value={{ userData, setUserData, loading, setLoading }}>
            {children}
        </UserContext.Provider>
    );
};
