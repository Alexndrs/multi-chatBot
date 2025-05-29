import { createContext } from 'react';

export interface Message {
    msgId: string | null;
    role: string | null;
    content: string | null;
    timestamp: string | null;
}

export interface ConversationData {
    convId: string | null;
    convName: string | null;
    date: string | null;
    msgList: Message[] | null;
}

export interface ConversationContextType {
    ConversationData: ConversationData | null;
    setConversationData: React.Dispatch<React.SetStateAction<ConversationData | null>>;
}


export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);