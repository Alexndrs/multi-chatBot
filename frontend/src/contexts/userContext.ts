import { createContext } from 'react';
import type { ConversationItem } from '../components/sidebar/sideBar';


export type ApiInfo = {
    isFree: boolean;
    name: string;
    url: string;
};

export type ModelBudget = {
    RPM: number;
    RPD: number;
    TPM: number;
    TPD: number;
};

export type ModelInfo = {
    api: string;
    budget?: ModelBudget;
    task: 'text-2-text' | 'multimodal-2-text';
};

export type Apis = Record<string, ApiInfo>;
export type Models = Record<string, ModelInfo>;


export interface UserData {
    name: string | null;
    email: string | null;
    token: string | null;
    conversations: ConversationItem[] | null;
    userApis: string[] | null;
    verified?: boolean;
}


export interface UserContextType {
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;

    availableApis: Apis | null;
    setAvailableApis: React.Dispatch<React.SetStateAction<Apis | null>>;
    availableModels: Models | null;
    setAvailableModels: React.Dispatch<React.SetStateAction<Models | null>>;

    status: 'unverified' | 'verified' | 'unauthenticated';
    setStatus: React.Dispatch<React.SetStateAction<'unverified' | 'verified' | 'unauthenticated'>>;
}


export const UserContext = createContext<UserContextType | undefined>(undefined);