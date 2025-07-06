import { createContext } from 'react';

export interface Message {
    msgId: string | null;
    role: string | null;
    content: string | null;
    thinkContent?: string | null;
    timestamp: string | null;
    convId?: string;
    convName?: string;
    token: number;
}

export interface ConversationData {
    convId: string | null;
    convName: string | null;
    date: string | null;
    msgList: Message[] | null;
}

export interface ConversationContextType {
    conversation: ConversationData | null;
    setConversation: React.Dispatch<React.SetStateAction<ConversationData | null>>;
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedModel: string;
    setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
    task: string;
    setTask: React.Dispatch<React.SetStateAction<string>>;
}


export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);