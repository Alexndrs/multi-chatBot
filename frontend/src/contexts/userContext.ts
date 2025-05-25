import { createContext } from 'react';
import type { ConversationItem } from '../components/sidebar/sideBar';

export interface UserData {
    name: string | null;
    email: string | null;
    token: string | null;
    userId: string | null;
    conversations: ConversationItem[] | null;
}

export interface UserContextType {
    UserData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}


export const UserContext = createContext<UserContextType | undefined>(undefined);