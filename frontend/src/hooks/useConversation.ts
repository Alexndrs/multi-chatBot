import { useContext } from 'react';
import { ConversationContext } from '../contexts/conversationContext';

export function useConversation() {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useConversationContext must be used within a ConversationProvider');
    }
    return context;
}