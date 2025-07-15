import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';


let db = null;

export async function getDB() {
    if (!db) {
        db = await open({
            filename: './db.sqlite',
            driver: sqlite3.Database,
        });
    }
    return db;
}

export async function initDB() {
    const db = await getDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            preferences TEXT,
            isVerified INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS conversations (
            convId TEXT PRIMARY KEY,
            userId TEXT,
            convName TEXT,
            date TEXT,
            token INTEGER,
            FOREIGN KEY (userId) REFERENCES users(userId)
        );

        CREATE TABLE IF NOT EXISTS messages (
            msgId TEXT PRIMARY KEY,
            convId TEXT,
            role TEXT,
            content TEXT,
            timestamp TEXT,
            token INTEGER,
            historyTokens INTEGER,
            FOREIGN KEY (convId) REFERENCES conversations(convId)
        );

        CREATE TABLE IF NOT EXISTS keys (
            keyId TEXT PRIMARY KEY,
            userId TEXT,
            key TEXT,
            api TEXT,
            date TEXT
        );

        CREATE TABLE IF NOT EXISTS verifications (
            userId TEXT PRIMARY KEY,
            code TEXT,
            FOREIGN KEY (userId) REFERENCES users(userId)
        );
    `);


    // verify if column isVerified exists
    const columns = await db.all(`PRAGMA table_info(users);`);
    const hasIsVerified = columns.some(col => col.name === 'isVerified');
    if (!hasIsVerified) {
        await db.run(`ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0`);
    }

    // Make sure all users have a verification code if they are not verified
    const unverifiedUsers = await db.all(`SELECT userId FROM users WHERE isVerified = 0`);
    for (const user of unverifiedUsers) {
        const exists = await db.get(`SELECT 1 FROM verifications WHERE userId = ?`, user.userId);
        if (!exists) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await db.run(`INSERT INTO verifications (userId, code) VALUES (?, ?)`, user.userId, code);
        }
    }

    // Cleaning the database (conv with no user, messages with no conv)
    await db.run(`
        DELETE FROM conversations
        WHERE userId NOT IN (SELECT userId FROM users)
    `);

    await db.run(`
        DELETE FROM messages
        WHERE convId NOT IN (SELECT convId FROM conversations)
    `);

    // Removing the API key that don't have a user
    await db.run(`
        DELETE FROM keys
        WHERE userId NOT IN (SELECT userId FROM users)
    `);

}


// --- USERS ---

export async function addUser(user, code) {
    console.log('Adding user:', user, code);
    const db = await getDB();
    const { userId, userInfo, conversations } = user;
    const { name, email, password, preferences } = userInfo;

    await db.run(
        `INSERT INTO users (userId, name, email, password, preferences, isVerified) VALUES (?, ?, ?, ?, ?, ?)`,
        userId,
        name,
        email,
        password,
        JSON.stringify(preferences || {}),
        0
    );

    await db.run(
        `INSERT INTO verifications (userId, code) VALUES (?, ?)`,
        userId,
        code
    );

    if (conversations && conversations.length > 0) {
        for (const conv of conversations) {
            await db.run(
                `INSERT INTO conversations (convId, userId, convName, date, token) VALUES (?, ?, ?, ?, ?, ?)`,
                conv.convId,
                userId,
                conv.convName || '',
                conv.date || new Date().toISOString(),
                conv.token || 0
            );
        }
    }

    return userId;
}

export async function isVerified(userId) {
    const db = await getDB();
    const user = await db.get(`SELECT isVerified FROM users WHERE userId = ?`, userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user.isVerified === 1;
}

export async function setUserVerified(userId) {
    const db = await getDB();
    const res = await db.run(`UPDATE users SET isVerified = 1 WHERE userId = ?`, userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
    await db.run(`DELETE FROM verifications WHERE userId = ?`, userId);
    return true;
}

export async function getUserVerificationCode(userId) {
    const db = await getDB();
    const verification = await db.get(`SELECT code FROM verifications WHERE userId = ?`, userId);
    if (!verification) throw new Error('Verification code not found');
    return verification.code;
}


export async function getUserById(userId) {
    const db = await getDB();
    const userRow = await db.get(`SELECT * FROM users WHERE userId = ?`, userId);
    if (!userRow) return undefined;
    return {
        userId: userRow.userId,
        userInfo: {
            name: userRow.name,
            email: userRow.email,
            password: userRow.password,
            preferences: JSON.parse(userRow.preferences || '{}')
        },
        conversations: await getUserConversations(userRow.userId)
    };
}


export async function getUserByMail(email) {
    const db = await getDB();
    const userRow = await db.get(`SELECT * FROM users WHERE email = ?`, email);
    if (!userRow) return undefined;
    return {
        userId: userRow.userId,
        userInfo: {
            name: userRow.name,
            email: userRow.email,
            password: userRow.password,
            preferences: JSON.parse(userRow.preferences || '{}')
        },
        conversations: await getUserConversations(userRow.userId)
    };
}

export async function getUserInfo(userId) {
    const db = await getDB();
    const user = await db.get(`SELECT name, email, preferences FROM users WHERE userId = ?`, userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return {
        name: user.name,
        email: user.email,
        preferences: JSON.parse(user.preferences || '{}')
    };
}

export async function getUserKeys(userId) {
    const db = await getDB();
    const keys = await db.all(`SELECT keyId, key, api, date FROM keys WHERE userId = ?`, userId);
    return keys.map(k => ({
        keyId: k.keyId,
        key: k.key,
        api: k.api,
        date: k.date
    }));
}

export async function getUserKeysForApi(userId, api_name) {
    const db = await getDB();
    // The key is supposed to be unique per user and API, so we can use a simple query
    const key = await db.get(`SELECT keyId, key, date FROM keys WHERE userId = ? AND api = ?`, userId, api_name);
    if (!key) return undefined;
    return {
        keyId: key.keyId,
        key: key.key,
        date: key.date
    };
}

export async function addUserKey(userId, encrypted_key, api_name) {
    // Hash the key before storing it
    const db = await getDB();
    const keyId = uuidv4();
    const date = new Date().toISOString();

    // If a key already exists for this user and API, update it
    const existingKey = await db.get(`SELECT keyId FROM keys WHERE userId = ? AND api = ?`, userId, api_name);
    if (existingKey) {
        await db.run(
            `UPDATE keys SET key = ?, date = ? WHERE userId = ? AND api = ?`,
            encrypted_key,
            date,
            userId,
            api_name
        );
        return;
    }

    await db.run(
        `INSERT INTO keys (keyId, userId, key, api, date) VALUES (?, ?, ?, ?, ?)`,
        keyId,
        userId,
        encrypted_key,
        api_name,
        date
    );
}

export async function deleteKey(userId, api_name) {
    const db = await getDB();
    const res = await db.run(`DELETE FROM keys WHERE userId = ? AND api = ?`, userId, api_name);
    if (res.changes === 0) throw new Error('Clé non trouvée');
}

export async function updateUser(userId, updatedInfo) {
    const db = await getDB();
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(updatedInfo)) {
        if (key === 'userInfo') {
            if (val.name !== undefined) {
                fields.push('name = ?');
                values.push(val.name);
            }
            if (val.email !== undefined) {
                fields.push('email = ?');
                values.push(val.email);
            }
            if (val.password !== undefined) {
                fields.push('password = ?');
                values.push(val.password);
            }
            if (val.preferences !== undefined) {
                fields.push('preferences = ?');
                values.push(JSON.stringify(val.preferences));
            }
        } else {
            fields.push(`${key} = ?`);
            values.push(val);
        }
    }

    if (fields.length === 0) return;

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE userId = ?`;
    const res = await db.run(sql, ...values);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
}


// --- CONVERSATIONS ---

export async function addConversation(userId, conversation) {
    const db = await getDB();
    const { convId, convName, date, token } = conversation;
    await db.run(
        `INSERT INTO conversations (convId, userId, convName, date, token) VALUES (?, ?, ?, ?, ?)`,
        convId,
        userId,
        convName,
        date,
        token
    );
    return convId;
}


export async function getUserConversations(userId) {
    const db = await getDB();
    const convRows = await db.all(`SELECT * FROM conversations WHERE userId = ? ORDER BY date DESC`, userId);

    return convRows.map(async c => ({
        convId: c.convId,
        convName: c.convName,
        date: c.date,
        token: c.token,
        msgList: await getAllMessages(userId, c.convId)
    }));
}


export async function getUserConversationsIdAndNameAndDate(userId) {
    const db = await getDB();
    return db.all(`SELECT convId, convName, date FROM conversations WHERE userId = ? ORDER BY date DESC`, userId);
}


export async function getConversationById(userId, convId) {
    const db = await getDB();
    const conv = await db.get(`SELECT * FROM conversations WHERE userId = ? AND convId = ?`, userId, convId);
    if (!conv) throw new Error('Conversation non trouvée');
    const messages = await db.all(`SELECT * FROM messages WHERE convId = ? ORDER BY timestamp ASC`, convId);

    return {
        convId: conv.convId,
        convName: conv.convName,
        date: conv.date,
        token: conv.token,
        msgList: messages
    };
}


export async function deleteConversation(userId, convId) {
    const db = await getDB();
    await db.run(`DELETE FROM messages WHERE convId = ?`, convId);
    const res = await db.run(`DELETE FROM conversations WHERE userId = ? AND convId = ?`, userId, convId);
    if (res.changes === 0) throw new Error('Conversation non trouvée');
}


export async function changeConversationName(userId, convId, newName) {
    const db = await getDB();
    const res = await db.run(`UPDATE conversations SET convName = ? WHERE userId = ? AND convId = ?`, newName, userId, convId);
    if (res.changes === 0) throw new Error('Conversation non trouvée');
}


export async function addToken(userId, convId, tokenToAdd) {
    const db = await getDB();
    await db.run(`
    UPDATE conversations
    SET token = token + ?
    WHERE userId = ? AND convId = ?
  `, tokenToAdd, userId, convId);
}


// --- MESSAGES ---

export async function addMessage(userId, convId, message) {
    const db = await getDB();
    await getConversationById(userId, convId);

    const { msgId = uuidv4(), role, content, timestamp = new Date().toISOString(), token = 0, historyTokens = 0 } = message;

    await db.run(
        `INSERT INTO messages (msgId, convId, role, content, timestamp, token, historyTokens) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        msgId,
        convId,
        role,
        content,
        timestamp,
        token,
        historyTokens
    );

    await db.run(`UPDATE conversations SET date = ? WHERE convId = ?`, new Date().toISOString(), convId);
    return msgId;
}


export async function getMessageById(userId, convId, msgId) {
    const db = await getDB();

    const message = await db.get(`
    SELECT m.*
    FROM messages m
    JOIN conversations c ON m.convId = c.convId
    WHERE m.msgId = ? AND m.convId = ? AND c.userId = ?
  `, msgId, convId, userId);
    if (!message) throw new Error('Message non trouvé');

    return message;
}


export async function getAllMessages(userId, convId) {
    const db = await getDB();
    const conv = await getConversationById(userId, convId);
    return conv.msgList
}


export async function editMessage(userId, convId, msgId, newContent) {
    const db = await getDB();
    await getMessageById(userId, convId, msgId);

    await db.run(`
    UPDATE messages
    SET content = ?, timestamp = ?
    WHERE msgId = ? AND convId = ?
  `, newContent, new Date().toISOString(), msgId, convId);

    await db.run(`UPDATE conversations SET date = ? WHERE convId = ?`, new Date().toISOString(), convId);
}


export async function deleteMessage(userId, convId, msgId) {
    const db = await getDB();
    await getMessageById(userId, convId, msgId);

    await db.run(`
    DELETE FROM messages WHERE msgId = ? AND convId = ?
  `, msgId, convId);
}

