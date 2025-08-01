import { serverUrl } from "./config";
import { getToken } from "./user";
import { type Conversation, type ConversationMetadata, type Graph, type Message } from "./types";

export const getConversationList = async (): Promise<ConversationMetadata[]> => {
    const response = await fetch(`${serverUrl}/conversation`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch conversation list');
    }

    const json = await response.json();
    return json as ConversationMetadata[];
}

export const getConversation = async (id: string): Promise<{ graph: Graph, conversation: Conversation }> => {
    const response = await fetch(`${serverUrl}/conversation/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch conversation');
    }


    const json = await response.json();
    return json as { graph: Graph, conversation: Conversation }
}

export const deleteConversation = async (id: string) => {
    const response = await fetch(
        `${serverUrl}/conversation/${id}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
}

/**
 * When the user starts a new conversation, the response is streamed in multiple parts :
 * 1. the conversation metadata (convId, convName) is created and returned
 * 2. the first message is sent to the server, which returns a container for this msg (type Message with content = firstMessage)
 * 3. the server send the container for the replies messages (potentially multiple) with a replyContainer : record<string, Message>
 * 4. the server sends the stream of token with a tag for each models ({model : string, token: string})
 *
 * @param firstMessage
 */
export const addConversation = async (
    firstMessage: string,
    modelNames: string[],
    onConvContainer: (conv: Conversation) => void,
    onMessageContainer: (message: Message) => void,
    onReplyContainer: (replyContainer: Record<string, Message>, firstMessageId: string) => void,
    onToken: (model: string, token: string, replyContainer: Record<string, Message>) => void,
    onFinalReplies: (replies: Record<string, Message>) => void
): Promise<Conversation> => {

    const response = await fetch(`${serverUrl}/conversation`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageContent: firstMessage, modelNames })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    let conversation: Conversation | null = null;

    let resolveConversation!: () => void;
    const conversationPromise = new Promise<void>((resolve) => {
        resolveConversation = resolve;
    });

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
                case 'convContainer': {
                    conversation = jsonData as Conversation;
                    onConvContainer(conversation);
                    resolveConversation();
                    break;
                }
                case 'messageContainer': {
                    const firstMessageObject = jsonData as Message;
                    conversationPromise.then(() => {
                        onMessageContainer(firstMessageObject);
                        resolveFirstMessage(firstMessageObject);
                    });
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
                    console.log('[PING] Final replies received');
                    break;
                case 'error':
                    throw new Error(jsonData.message || 'Unknown streamed error');
                default:
                    console.warn(`Unhandled tag: <<${tag}>>`);
            }
        }

        if (done) break;
    }

    if (!conversation) {
        throw new Error('Conversation not initialized from stream');
    }

    console.log('[PING] Conversation stream ended');
    return conversation;
};

