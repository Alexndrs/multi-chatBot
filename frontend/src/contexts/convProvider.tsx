import React, { useState } from 'react';
import { ConversationContext } from './convContext';
import type { ConversationData } from './convContext';

interface Props {
    children: React.ReactNode;
}

export const ConvProvider: React.FC<Props> = ({ children }) => {
    const [conversationData, setConversationData] = useState<ConversationData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <ConversationContext.Provider value={{ ConversationData: conversationData, setConversationData, modalOpen, setModalOpen }}>
            {children}
        </ConversationContext.Provider>
    );
};
