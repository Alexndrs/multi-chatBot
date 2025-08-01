export type Message = {
    msgId: string;
    convId: string;
    role: 'user' | 'assistant';
    author: string;
    content: string;
    timestamp: string;
    token: number;
    historyToken: number;
}

export type Node = {
    message: Message;
    parents: string[];
    children: string[];
}

export type Graph = {
    rootId: string[];
    messagesMap: Record<string, Node>;
}

export const defaultGraph: Graph = {
    rootId: [],
    messagesMap: {},
}

export type Conversation = {
    convId: string;
    userId: string;
    convName: string;
    date: string;
    token: number;
}

export const defaultConversation: Conversation = {
    convId: '',
    userId: '',
    convName: 'Hello, ask me anything!',
    date: '',
    token: 0,
}

export type ConversationMetadata = {
    userId: string;
    convId: string;
    convName: string;
    date: string;
    token: number;
}

export type ApiKey = {
    keyId: string;
    key: string;
    api: string;
    date: string
};


// High level type for the UI

export type splittedMessage = Message & {
    thinkContent: string;
    mainContent: string;
}

export type multiMessage = {
    role: 'user' | 'assistant' | 'merger';
    messages: splittedMessage[]; // Array of messages that respond to the same message
}


export type linearConversation = multiMessage[]; // Array of multiMessage, where each multiMessage represents a conversation turn