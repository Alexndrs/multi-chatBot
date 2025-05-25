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


export const getToken = () => localStorage.getItem('token');

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
    return data;
}