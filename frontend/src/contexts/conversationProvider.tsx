import React, { useState, type JSX } from 'react';
import { ConversationContext } from './conversationContext';
import { type Conversation, type Graph, defaultConversation, defaultGraph } from '../api/types';


interface Props {
    children: React.ReactNode;
}


export function ConversationProvider({ children, }: Props): JSX.Element {

    const [conversation, setConversation] = useState<Conversation>(defaultConversation);
    const [graph, setGraph] = useState<Graph>(defaultGraph)

    return (
        <ConversationContext.Provider value={{ conversation, setConversation, graph, setGraph }}>
            {children}
        </ConversationContext.Provider>
    )
}