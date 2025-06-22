import React, { useState } from 'react';
import { ConversationContext } from './convContext';
import type { ConversationData } from './convContext';

interface Props {
    children: React.ReactNode;
}

export const ConvProvider: React.FC<Props> = ({ children }) => {
    const [conversationData, setConversationData] = useState<ConversationData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modelName, setModelName] = useState('llama-3.1-8b-instant');
    const [task, setTask] = useState('text-2-text');

    return (
        <ConversationContext.Provider value={{ ConversationData: conversationData, setConversationData, modalOpen, setModalOpen, modelName, setModelName, task, setTask }}>
            {children}
        </ConversationContext.Provider>
    );
};
