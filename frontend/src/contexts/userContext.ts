import { createContext } from 'react';
import type { ConversationItem } from '../components/sidebar/sideBar';

export interface UserData {
    name: string | null;
    email: string | null;
    token: string | null;
    conversations: ConversationItem[] | null;
}

export interface UserContextType {
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


export const UserContext = createContext<UserContextType | undefined>(undefined);