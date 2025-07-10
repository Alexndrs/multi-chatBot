import type { ConversationItem } from "./components/sidebar/sideBar";
import type { ConversationData, Message } from "./contexts/convContext";
import type { Apis, Models, UserData } from "./contexts/userContext";
// const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
const serverUrl = 'http://localhost:8000';

export const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found, please login');
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            throw new Error('Token expired');
        }
    } catch {
        localStorage.removeItem('token');
        throw new Error('Invalid token');
    }
    return token;
}

export const removeToken = () => {
    localStorage.removeItem('token');
}

async function jsonRequest<T>(input: RequestInfo, init: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

async function streamJson<T, R = void>(
    response: Response,
    handlers: {
        onContainer?: (data: T) => R | void;
        onToken?: (token: string) => void;
        onThink?: (think: string) => void;
        onUsage?: (usage: { currentMessageTokens: number, historyTokens: number, responseToken: number }) => void;
    }
): Promise<R | void> {
    if (!response.body) throw new Error('No body');
    const reader = response.body.getReader();
    const txt = new TextDecoder();
    let buf = '', thinking = false, thinkBuf = '';

    while (true) {
        const { done, value } = await reader.read();
        const chunk = txt.decode(value || new Uint8Array(), { stream: true });
        buf += chunk;


        // parse JSON containers
        const containerMatch = buf.match(/<<([A-Za-z]+)>>/);
        if (containerMatch) {
            const tag = containerMatch[1];
            const [prefix, rest] = buf.split(new RegExp(`<<${tag}>>`));
            buf = prefix;
            let data;
            try {
                data = JSON.parse(rest.trim());
            } catch (e) {
                console.warn('Invalid JSON in stream:', e);
                return;
            }
            switch (tag) {
                case 'MsgCONTAINER':
                case 'convContainer':
                    handlers.onContainer?.(data as T);
                    break;
                case 'tokenUsage':
                    handlers.onUsage?.({ currentMessageTokens: data.currentMessageTokens, historyTokens: data.historyTokens, responseToken: data.responseToken });
                    break;
                case 'error':
                    throw new Error(data.message || 'Streamed error from server');
            }
        }

        // parse think tags and tokens
        while (buf) {
            if (!thinking) {
                const idx = buf.indexOf('<think>');
                if (idx >= 0) {
                    const before = buf.slice(0, idx);
                    handlers.onToken?.(before);
                    buf = buf.slice(idx + 7);
                    thinking = true;
                    thinkBuf = '';
                } else {
                    handlers.onToken?.(buf);
                    buf = '';
                }
            } else {
                const idx = buf.indexOf('</think>');
                if (idx >= 0) {
                    thinkBuf += buf.slice(0, idx);
                    handlers.onThink?.(thinkBuf.trim());
                    buf = buf.slice(idx + 8);
                    thinking = false;
                } else {
                    thinkBuf += buf;
                    handlers.onThink?.(thinkBuf);
                    buf = '';
                }
            }
        }

        if (done) break;
    }

    if (thinking && thinkBuf.trim()) {
        handlers.onThink?.(thinkBuf.trim() + '...');
        handlers.onToken?.('Should I continue thinking?');
    }
}

export const createUser = async (name: string, mail: string, password: string) => {
    const json = await jsonRequest<{ token: string }>(
        `${serverUrl}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, password })
    })
    localStorage.setItem('token', json.token);
}

export const loginUser = async (mail: string, password: string) => {

    const json = await jsonRequest<{ token: string }>(
        `${serverUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, password })
    });
    localStorage.setItem('token', json.token);
}

export const logoutUser = () => {
    removeToken();
    window.location.reload();
}

interface allUserInfo {
    userInfo: UserData;
    apiInfo: { userApis: string[], availableApis: Apis, availableModels: Models };
}

export const getUserInfo = async (): Promise<allUserInfo> => {
    const json = await jsonRequest<allUserInfo>(
        `${serverUrl}/user`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    return json
}


export const getUserConversations = async () => {
    const json = await jsonRequest<{ conversationsIdsAndNameAndDate: ConversationItem[] }>(
        `${serverUrl}/conversation`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    return json.conversationsIdsAndNameAndDate
}

export const getConversation = async (id: string) => {

    const json = await jsonRequest<{ response: ConversationData }>(
        `${serverUrl}/conversation/${id}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    return json.response;
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

async function convoStream<T, R = void>(
    path: string,
    payload: object,
    handlers: {
        onContainer?: (data: T) => R | void;
        onToken?: (token: string) => void;
        onThink?: (think: string) => void;
        onUsage?: (usage: { currentMessageTokens: number, historyTokens: number, responseToken: number }) => void;
    },
    method: 'POST' | 'PUT' = 'POST'

): Promise<R | void> {
    const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    let containerData: R | undefined;
    await streamJson<T, R>(response, {
        ...handlers,
        onContainer: (data: T) => {
            const result = handlers.onContainer?.(data);
            if (typeof result !== "undefined") {
                containerData = result;
            }
            return result as R;
        }
    });
    return containerData;
}

export const createConversation = async (
    msg: string,
    model: string,
    onConv: (conv: ConversationItem) => void,
    onTitleTok: (tok: string, convId: string) => void
) => {
    let currentConvId = '';
    const containerData = await convoStream<{ conv: ConversationItem }, ConversationItem>(
        `${serverUrl}/conversation`,
        { messageContent: msg, model_name: model },
        {
            onContainer: (data) => {
                currentConvId = data.conv.convId;
                onConv(data.conv);
                return data.conv;
            },
            onToken: tok => {
                if (currentConvId) {
                    onTitleTok(tok, currentConvId);
                }
            },
            onThink: () => { },
            onUsage: () => { }
        }
    );
    if (!containerData) {
        throw new Error('Failed to create conversation, please verify your API key');
    }
    return containerData.convId;
}

export const sendMessage = (
    convId: string,
    msg: string,
    model: string,
    onContainer: (u: Message, b: Message) => void,
    onToken: (tok: string) => void,
    onUsage: (c: number, h: number, r: number) => void,
    onThink: (think: string) => void
) => {
    return convoStream(
        `${serverUrl}/message/`,
        { convId, messageContent: msg, model_name: model },
        {
            onContainer: (data: { userMsg: Message, newMsg: Message }) => onContainer(data.userMsg, data.newMsg),
            onToken, onThink,
            onUsage: usage => onUsage(usage.currentMessageTokens, usage.historyTokens, usage.responseToken)
        }
    );
}

export const updateMessage = (
    convId: string,
    msgId: string,
    newContent: string,
    model: string,
    onContainer: (m: Message) => void,
    onToken: (tok: string) => void,
    onUsage: (c: number, h: number, r: number) => void,
    onThink: (think: string) => void
) => {
    return convoStream(
        `${serverUrl}/message/`,
        { convId, msgId, newContent, model_name: model },
        {
            onContainer: (data: { newMsg: Message }) => onContainer(data.newMsg),
            onToken, onThink,
            onUsage: usage => onUsage(usage.currentMessageTokens, usage.historyTokens, usage.responseToken)
        },
        'PUT'
    );
}


type apiAnswer = {
    message: string;
    error?: boolean;
}
export const addApiKey = async (api: string, key: string) => {
    try {
        const answer = await jsonRequest<apiAnswer>(
            `${serverUrl}/apiKeys`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ api, key })
        })
        if (answer.error) {
            throw new Error(answer.message);
        }
        return answer.message;
    } catch (error) {
        console.error('Error adding API key:', error);
        throw new Error(`Failed to add API key for ${api}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Delete an API key for a given api name
export const deleteApiKey = async (api: string) => {
    await jsonRequest<void>(
        `${serverUrl}/apiKeys/${api}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    })
}

export type ApiKey = { keyId: string; key: string; api: string; date: string };

export const getApiKeys = async () => {
    const json = await jsonRequest<ApiKey[]>(
        `${serverUrl}/apiKeys`, { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    return json;
}