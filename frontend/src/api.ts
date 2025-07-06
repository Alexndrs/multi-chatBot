import type { ConversationItem } from "./components/sidebar/sideBar";
import type { Message } from "./contexts/convContext";
// const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
const serverUrl = 'http://localhost:8000';


// The following test user is used for testing purposes only
//  {
//       "userId": "e940b7b9-88f0-4355-8a20-3bc4994ae099",
//       "userInfo": {
//         "name": "Alex",
//         "email": "alex@example.com",
//         "password": "$2b$10$Z7Rd6jxAmaejNHdZ.sIXKeQ8bfB67cofkjMwZKQTy2E0gUXt3AcKO", (not hashed = password123)
//         "preferences": {}
//       },
//      "conversations": [...]
// }


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
        onUsage?: (usage: { promptToken: number; responseToken: number }) => void;
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
            try {
                const data = JSON.parse(rest.trim());
                switch (tag) {
                    case 'MsgCONTAINER':
                    case 'convContainer':
                        handlers.onContainer?.(data as T);
                        break;
                    case 'tokenUsage':
                        handlers.onUsage?.({ promptToken: data.tokenUsage, responseToken: 0 });
                        break;
                }
            } catch { /*ignore*/ }
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
}

export const createUser = async (name: string, mail: string, password: string) => {
    const json = await jsonRequest<{ token: string }>(
        `${serverUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, password })
    })
    localStorage.setItem('token', json.token);
}

export const loginUser = async (mail: string, password: string) => {

    const json = await jsonRequest<{ token: string }>(
        `${serverUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, password })
    });
    localStorage.setItem('token', json.token);
}

export const getUserInfo = async () => {
    const json = await jsonRequest(
        `${serverUrl}/auth`,
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

    const json = await jsonRequest<{ response: Message[] }>(
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
        onUsage?: (usage: { promptToken: number; responseToken: number }) => void;
    }

): Promise<R | void> {
    const response = await fetch(path, {
        method: 'POST',
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
        throw new Error('Failed to create conversation');
    }
    return containerData.convId;
}


export const sendMessage = (
    convId: string, msg: string, model: string,
    onContainer: (u: Message, b: Message) => void,
    onToken: (tok: string) => void,
    onUsage: (p: number, r: number) => void,
    onThink: (think: string) => void
) => convoStream(
    `${serverUrl}/message/`, { convId, messageContent: msg, model_name: model }, {
    onContainer: (data: { userMsg: Message, newMsg: Message }) => onContainer(data.userMsg, data.newMsg),
    onToken, onThink,
    onUsage: usage => onUsage(usage.promptToken, usage.responseToken)
}
);

export const updateMessage = (
    convId: string, msgId: string, newContent: string, model: string,
    onContainer: (m: Message) => void,
    onToken: (tok: string) => void,
    onUsage: (p: number, r: number) => void,
    onThink: (think: string) => void
) => convoStream(
    `${serverUrl}/message/`, { convId, msgId, newContent, model_name: model }, {
    onContainer: (data: { newMsg: Message }) => onContainer(data.newMsg),
    onToken, onThink,
    onUsage: usage => onUsage(usage.promptToken, usage.responseToken)
}
);