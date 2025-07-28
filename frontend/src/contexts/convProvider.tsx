import React, { useState } from 'react';
import { ConversationContext } from './convContext';
import type { ConversationData } from './convContext';

interface Props {
    children: React.ReactNode;
}

export const ConvProvider: React.FC<Props> = ({ children }) => {
    const [conversation, setConversation] = useState<ConversationData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(['llama-3.1-8b-instant']);
    const [task, setTask] = useState('text-2-text');

    return (
        <ConversationContext.Provider value={{ conversation, setConversation, modalOpen, setModalOpen, selectedModel, setSelectedModel, task, setTask }}>
            {children}
        </ConversationContext.Provider>
    );
};
