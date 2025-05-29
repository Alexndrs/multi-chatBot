import { useContext } from 'react';
import { ConversationContext } from '../contexts/convContext';
import type { ConversationContextType } from '../contexts/convContext';

export const useConv = (): ConversationContextType => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
