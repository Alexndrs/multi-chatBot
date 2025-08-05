import React, { useState } from 'react';
import { UserContext } from './userContext';
import type { UserData, Apis, Models } from './userContext';
import type { Conversation } from '../api/types';

interface Props {
    children: React.ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableApis, setAvailableApis] = useState<Apis | null>(null);
    const [availableModels, setAvailableModels] = useState<Models | null>(null);
    const [status, setStatus] = useState<'unverified' | 'verified' | 'unauthenticated'>('unauthenticated');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string[]>(['llama-3.1-8b-instant']);
    const [convList, setConvList] = useState<Conversation[]>([]);



    return (
        <UserContext.Provider value={{ userData, setUserData, loading, setLoading, availableApis, setAvailableApis, availableModels, setAvailableModels, status, setStatus, modalOpen, setModalOpen, selectedModel, setSelectedModel, convList, setConvList }}>
            {children}
        </UserContext.Provider>
    );
};
