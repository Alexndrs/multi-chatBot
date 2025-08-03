import { serverUrl } from "./config";
import type { Message } from "./types";

import { getToken } from "./user";


/**
 * stream to collect :
 * 1. messageContainer
 * 2. replyContainer
 * 3. tokens (tk)
 * 4. finalReplies
 * 
 * @param firstMessage
 */
export const replyToMessage = async (
    convId: string,
    userMessage: string,
    modelNames: string[],
    parentId: string[],
    onMessageContainer: (message: Message) => void,
    onReplyContainer: (replyContainer: Record<string, Message>, firstMessageId: string) => void,
    onToken: (model: string, token: string, replyContainer: Record<string, Message>) => void,
    onFinalReplies: (replies: Record<string, Message>) => void
): Promise<void> => {

    const response = await fetch(`${serverUrl}/message/reply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ convId, messageContent: userMessage, modelNames, parentId })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    let resolveFirstMessage!: (msg: Message) => void;
    const firstMessagePromise = new Promise<Message>((resolve) => {
        resolveFirstMessage = resolve;
    });

    let resolveReplyContainer!: (replyContainer: Record<string, Message>) => void;
    const replyContainerPromise = new Promise<Record<string, Message>>((resolve) => {
        resolveReplyContainer = resolve;
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const tagRegex = /<<([A-Za-z]+)>>/g;

    while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        buffer += chunk;

        while (true) {
            const startMatch = tagRegex.exec(buffer);
            if (!startMatch) break;

            const tag = startMatch[1];
            const contentStart = tagRegex.lastIndex;

            const nextMatch = tagRegex.exec(buffer);
            const contentEnd = nextMatch ? nextMatch.index : buffer.length;

            const jsonStr = buffer.slice(contentStart, contentEnd).trim();
            let jsonData;
            try {
                jsonData = JSON.parse(jsonStr);
                buffer = buffer.slice(nextMatch ? nextMatch.index : buffer.length);
                tagRegex.lastIndex = 0;
            } catch {
                // JSON incomplete → wait for more data
                break;
            }

            switch (tag) {
                case 'messageContainer': {
                    const firstMessageObject = jsonData as Message;
                    onMessageContainer(firstMessageObject);
                    resolveFirstMessage(firstMessageObject);
                    break;
                }
                case 'replyContainer': {
                    const replyContainer = jsonData as Record<string, Message>;

                    firstMessagePromise.then((firstMsg) => {
                        onReplyContainer(replyContainer, firstMsg.msgId);
                        resolveReplyContainer(replyContainer);
                    });
                    break;
                }
                case 'tk': {
                    replyContainerPromise.then((replyContainer) => {
                        onToken(jsonData.model as string, jsonData.token as string, replyContainer);

                    })
                    break;
                }
                case 'finalReplies':
                    onFinalReplies(jsonData as Record<string, Message>);
                    break;
                case 'error':
                    throw new Error(jsonData.message || 'Unknown streamed error');
                default:
                    console.warn(`Unhandled tag: <<${tag}>>`);
            }
        }

        if (done) break;
    }
};



export const editMessage = async (convId: string,
    newContent: string,
    msgId: string,
    modelNames: string[],
    onReplyContainer: (replyContainer: Record<string, Message>, firstMessageId: string) => void,
    onToken: (model: string, token: string, replyContainer: Record<string, Message>) => void,
    onFinalReplies: (replies: Record<string, Message>) => void
): Promise<void> => {

    const response = await fetch(`${serverUrl}/message/edit`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ convId, msgId, newContent, modelNames })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    let resolveReplyContainer!: (replyContainer: Record<string, Message>) => void;
    const replyContainerPromise = new Promise<Record<string, Message>>((resolve) => {
        resolveReplyContainer = resolve;
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const tagRegex = /<<([A-Za-z]+)>>/g;

    while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        buffer += chunk;

        while (true) {
            const startMatch = tagRegex.exec(buffer);
            if (!startMatch) break;

            const tag = startMatch[1];
            const contentStart = tagRegex.lastIndex;

            const nextMatch = tagRegex.exec(buffer);
            const contentEnd = nextMatch ? nextMatch.index : buffer.length;

            const jsonStr = buffer.slice(contentStart, contentEnd).trim();
            let jsonData;
            try {
                jsonData = JSON.parse(jsonStr);
                buffer = buffer.slice(nextMatch ? nextMatch.index : buffer.length);
                tagRegex.lastIndex = 0;
            } catch {
                // JSON incomplete → wait for more data
                break;
            }

            switch (tag) {
                case 'replyContainer': {
                    const replyContainer = jsonData as Record<string, Message>;
                    onReplyContainer(replyContainer, msgId);
                    resolveReplyContainer(replyContainer);
                    break;
                }
                case 'tk': {
                    replyContainerPromise.then((replyContainer) => {
                        onToken(jsonData.model as string, jsonData.token as string, replyContainer);

                    })
                    break;
                }
                case 'finalReplies':
                    onFinalReplies(jsonData as Record<string, Message>);
                    break;
                case 'error':
                    throw new Error(jsonData.message || 'Unknown streamed error');
                default:
                    console.warn(`Unhandled tag: <<${tag}>>`);
            }
        }

        if (done) break;
    }
};



/**
 * stream to collect :
 * 1. mergeContainer
 * 2. tokens (tk)
 * 3. finalMerge
 * 
 * @param firstMessage
 */
export const mergeMessages = async (
    convId: string,
    modelName: string,
    parentId: string[],
    onMergeContainer: (message: Message) => void,
    onToken: (token: string, mergeContainer: Message) => void,
    onFinalMerge: (merge: Message) => void
): Promise<void> => {

    const response = await fetch(`${serverUrl}/message/merge`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ convId, modelName, parentId })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    let resolveMergeContainer!: (mergeContainer: Message) => void;
    const mergeContainerPromise = new Promise<Message>((resolve) => {
        resolveMergeContainer = resolve;
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const tagRegex = /<<([A-Za-z]+)>>/g;

    while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        buffer += chunk;

        while (true) {
            const startMatch = tagRegex.exec(buffer);
            if (!startMatch) break;

            const tag = startMatch[1];
            const contentStart = tagRegex.lastIndex;

            const nextMatch = tagRegex.exec(buffer);
            const contentEnd = nextMatch ? nextMatch.index : buffer.length;

            const jsonStr = buffer.slice(contentStart, contentEnd).trim();
            let jsonData;
            try {
                jsonData = JSON.parse(jsonStr);
                buffer = buffer.slice(nextMatch ? nextMatch.index : buffer.length);
                tagRegex.lastIndex = 0;
            } catch {
                // JSON incomplete → wait for more data
                break;
            }

            switch (tag) {
                case 'mergeContainer': {
                    const mergeContainer = jsonData as Message;
                    onMergeContainer(mergeContainer);
                    resolveMergeContainer(mergeContainer);
                    break;
                }
                case 'tk': {
                    mergeContainerPromise.then((mergeContainer) => {
                        onToken(jsonData.token as string, mergeContainer);

                    })
                    break;
                }
                case 'finalMerge':
                    onFinalMerge(jsonData as Message);
                    break;
                case 'error':
                    throw new Error(jsonData.message || 'Unknown streamed error');
                default:
                    console.warn(`Unhandled tag: <<${tag}>>`);
            }
        }

        if (done) break;
    }
};





/**
 * stream to collect :
 * 1. replyContainer
 * 2. tokens (tk)
 * 3. finalReplies
 * 
 * @param firstMessage
 */
export const regenerateMessage = async (
    convId: string,
    msgId: string,
    modelName: string,
    onReplyContainer: (replyContainer: Message) => void,
    onToken: (model: string, token: string, replyContainer: Record<string, Message>) => void,
    onFinalReplies: (replies: Message) => void
): Promise<void> => {

    const response = await fetch(`${serverUrl}/message/regenerate`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ convId, msgId, modelName })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    let resolveReplyContainer!: (replyContainer: Message) => void;
    const replyContainerPromise = new Promise<Message>((resolve) => {
        resolveReplyContainer = resolve;
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const tagRegex = /<<([A-Za-z]+)>>/g;

    while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        buffer += chunk;

        while (true) {
            const startMatch = tagRegex.exec(buffer);
            if (!startMatch) break;

            const tag = startMatch[1];
            const contentStart = tagRegex.lastIndex;

            const nextMatch = tagRegex.exec(buffer);
            const contentEnd = nextMatch ? nextMatch.index : buffer.length;

            const jsonStr = buffer.slice(contentStart, contentEnd).trim();
            let jsonData;
            try {
                jsonData = JSON.parse(jsonStr);
                buffer = buffer.slice(nextMatch ? nextMatch.index : buffer.length);
                tagRegex.lastIndex = 0;
            } catch {
                // JSON incomplete → wait for more data
                break;
            }

            switch (tag) {
                case 'replyContainer': {
                    const replyContainer = jsonData as Message;

                    onReplyContainer(replyContainer);
                    resolveReplyContainer(replyContainer);
                    break;
                }
                case 'tk': {
                    replyContainerPromise.then((replyContainer) => {
                        const replyContainerMap = { [modelName]: replyContainer };
                        onToken(jsonData.model as string, jsonData.token as string, replyContainerMap);
                    })
                    break;
                }
                case 'finalReply':
                    onFinalReplies(jsonData as Message);
                    break;
                case 'error':
                    throw new Error(jsonData.message || 'Unknown streamed error');
                default:
                    console.warn(`Unhandled tag: <<${tag}>>`);
            }
        }

        if (done) break;
    }
};


export const chooseReply = async (convId: string, msgId: string): Promise<void> => {
    const response = await fetch(`${serverUrl}/message/choose`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ convId, msgId })
    });

    if (!response.ok) {
        throw new Error('Failed to choose reply');
    }
};