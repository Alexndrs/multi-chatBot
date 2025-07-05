import type { ConversationItem } from "./components/sidebar/sideBar";
import type { Message } from "./contexts/convContext";
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
    console.log('Conversation data:', data);
    return data.response;
}

export const deleteConversation = async (conversationId: string) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete conversation');
    }
}




export const createConversation = async (
    message: string,
    model_name: string,
    onConvGenerated: (conv: ConversationItem) => void,
    onTitleToken: (token: string, currentConvId: string | null) => void
) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/conversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            messageContent: message,
            model_name: model_name
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

    let buffer = ''; // stocke les morceaux partiels

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Traitement des balises spéciales
        if (buffer.includes('<<convContainer>>')) {
            const parts = buffer.split('<<convContainer>>');
            const jsonStr = parts[1].trim();
            buffer = parts[0]; // on garde ce qu’il y avait avant, potentiellement du texte utile

            try {
                const data = JSON.parse(jsonStr);
                const conv = data.conv;
                onConvGenerated(conv);
                currentConvId = conv.convId;
            } catch (err) {
                console.error('Erreur de parsing du ConvContainer:', err);
            }
        }

        if (buffer.includes('<<tokenUsage>>')) {
            const parts = buffer.split('<<tokenUsage>>');
            const jsonStr = parts[1].trim();
            buffer = parts[0];
            try {
                const data = JSON.parse(jsonStr);
                console.log('Token usage:', data);
            } catch (err) {
                console.error('Erreur de parsing du TokenUsage:', err);
            }
        }

        // Traitement du texte tout en ignorant <think>...</think>
        let outputBuffer = '';
        while (true) {
            const startIdx = buffer.indexOf('<think>');
            const endIdx = buffer.indexOf('</think>');

            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                // Garder tout avant <think>
                outputBuffer += buffer.slice(0, startIdx);
                // Retirer tout jusqu’après </think>
                buffer = buffer.slice(endIdx + '</think>'.length);
            } else if (startIdx !== -1 && endIdx === -1) {
                // Début de <think> mais pas encore la fin → attendre chunk suivant
                break;
            } else {
                // Aucun think ou terminé → tout est du texte normal
                outputBuffer += buffer;
                buffer = '';
                break;
            }
        }

        if (outputBuffer.length > 0) {
            onTitleToken(outputBuffer, currentConvId);
        }
    }

    return currentConvId;
};

export const sendMessage = async (
    conversationId: string,
    message: string,
    model_name: string,
    onContainerGenerated: (userMsg: Message, newMsg: Message) => void,
    onToken: (token: string) => void,
    onTokenUsage: (promptToken: number, responseToken: number) => void,
    onThink: (thinkContent: string) => void
) => {
    const token = getToken();
    const response = await fetch(`${serverUrl}/message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            convId: conversationId,
            messageContent: message,
            model_name: model_name
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

    let buffer = ''; // accumulateur global
    let isThinking = false;
    let thinkBuffer = '';

    while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });

        if (chunk.includes('<<MsgCONTAINER>>')) {
            const jsonStr = chunk.split('<<MsgCONTAINER>>')[1].trim();
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

        if (chunk.includes('<<tokenUsage>>')) {
            const jsonStr = chunk.split('<<tokenUsage>>')[1].trim();
            try {
                const data = JSON.parse(jsonStr);
                onTokenUsage(data.promptToken, data.responseToken);
            } catch (err) {
                console.error('Erreur de parsing du TokenUsage:', err);
            }
            continue;
        }

        buffer += chunk;

        while (buffer.length > 0) {
            if (!isThinking) {
                const startIdx = buffer.indexOf('<think>');
                if (startIdx !== -1) {
                    // On a trouvé un début de <think>
                    const before = buffer.slice(0, startIdx);
                    if (before) {
                        fullText += before;
                        onToken(before);
                    }
                    buffer = buffer.slice(startIdx + '<think>'.length);
                    isThinking = true;
                    thinkBuffer = '';
                } else {
                    // Aucun <think> pour l'instant, on flush tout
                    fullText += buffer;
                    onToken(buffer);
                    buffer = '';
                    break;
                }
            } else {
                const endIdx = buffer.indexOf('</think>');
                if (endIdx !== -1) {
                    // Fin trouvée
                    thinkBuffer += buffer.slice(0, endIdx);
                    onThink(thinkBuffer.trim());
                    buffer = buffer.slice(endIdx + '</think>'.length);
                    isThinking = false;
                } else {
                    // Pas encore de fin → on accumule et attend
                    thinkBuffer += buffer;
                    onThink(thinkBuffer);
                    buffer = '';
                    break;
                }
            }
        }

        if (done) {
            break;
        }
    }

    // 🔥 Si le modèle n’a jamais fermé le <think>, on le flush quand même à la fin
    if (isThinking && thinkBuffer.trim()) {
        onThink(thinkBuffer.trim() + '...');
    }

    if (newMsg) {
        newMsg.content = fullText;
    }

    return { userMsg, newMsg };
};