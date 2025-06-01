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

export const createUser = async (name: string, mail: string, password: string) => {
    const response = await fetch(`${serverUrl}/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mail,
            name,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create user');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
}

export const loginUser = async (mail: string, password: string) => {
    const response = await fetch(`${serverUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mail,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to login user');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
}


export const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found, please login');
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            throw new Error('Token expired, please login again');
        }
    } catch {
        localStorage.removeItem('token');
        throw new Error('Invalid token, please login again');
    }
    return token;
}

export const getUserInfo = async () => {
    const token = getToken();

    const response = await fetch(`${serverUrl}/auth`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return data;
}


export const getUserConversations = async () => {
    const token = getToken();

    const response = await fetch(`${serverUrl}/conversation`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user conversations');
    }

    const data = await response.json();
    return data.conversationsIdsAndNameAndDate;
}

export const getConversation = async (conversationId: string) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/conversation/${conversationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get conversation');
    }

    const data = await response.json();
    return data.response;
}

export const createConversation = async (message: string, onConvGenerated: (conv: any) => any, onTitleToken: (token: string, currentConvId: string | null) => any) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/conversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            messageContent: message
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create conversation');
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let currentConvId: string | null = null;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.startsWith('<<convContainer>>')) {
            const jsonStr = chunk.slice('<<convContainer>>'.length).trim();
            try {
                const data = JSON.parse(jsonStr);
                const conv = data.conv;

                onConvGenerated(conv);
                console.log('🌳 Conversation generated:', conv);
                currentConvId = conv.convId;

            } catch (err) {
                console.error('Erreur de parsing du ConvContainer:', err);
            }
            continue;
        }

        onTitleToken(chunk, currentConvId);
    }
    return currentConvId;
};

export const sendMessage = async (conversationId: string, message: string, onContainerGenerated: (userMsg: any, newMsg: any) => any, onToken: (token: string) => any) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            convId: conversationId,
            messageContent: message
        })
    });

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullText = '';
    let userMsg = null;
    let newMsg = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.startsWith('<<MsgCONTAINER>>')) {
            const jsonStr = chunk.slice('<<MsgCONTAINER>>'.length).trim();
            try {
                const data = JSON.parse(jsonStr);
                userMsg = data.userMsg;
                newMsg = data.newMsg;
                onContainerGenerated(userMsg, newMsg);

            } catch (err) {
                console.error('Erreur de parsing du MsgCONTAINER:', err);
            }
            continue;
        }

        fullText += chunk;
        onToken(chunk);

    }

    if (newMsg) {
        newMsg.content = fullText;
    }

    return { userMsg, newMsg };
};