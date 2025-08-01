import { createContext } from 'react';

import type { Conversation, Graph } from "../api/types";


export interface ConversationContextType {
    conversation: Conversation;
    setConversation: React.Dispatch<React.SetStateAction<Conversation>>;
    graph: Graph;
    setGraph: React.Dispatch<React.SetStateAction<Graph>>;
}


export const ConversationContext = createContext<ConversationContextType | null>(null);
