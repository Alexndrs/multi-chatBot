import { serverUrl } from "./config";
import { getToken } from "./user";
import type { Conversation, ConversationMetadata, Graph } from "./types";

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
// export const addConversation = async (firstMessage: string, modelNames: string[]): Promise<Conversation> => {

//     const response = await fetch(`${serverUrl}/conversation`, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${getToken()}`,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ messageContent: firstMessage, modelNames })
//     });

//     if (!response.ok) {
//         throw new Error('Failed to create conversation');
//     }

//     if (!response.body) {
//         throw new Error('No response body received');
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder('utf-8');


// }