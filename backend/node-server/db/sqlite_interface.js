/// <reference path="../core/types.js" />
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
            author TEXT,
            content TEXT,
            timestamp TEXT,
            token INTEGER,
            historyTokens INTEGER,
            FOREIGN KEY (convId) REFERENCES conversations(convId)
        );

        CREATE TABLE IF NOT EXISTS message_parents (
            childId TEXT,
            parentId TEXT,
            PRIMARY KEY (childId, parentId),
            FOREIGN KEY (childId) REFERENCES messages(msgId),
            FOREIGN KEY (parentId) REFERENCES messages(msgId)
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

/**
 * Add a new user to the database
 * @param {string} userId 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password - hashed password
 * @param {string} code 
 * @param {Object} preferences 
 * @returns {Promise<string}
 */
export async function addUser(userId, name, email, password, code, preferences = {}) {
    const db = await getDB();

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

    return userId;
}

/**
 * @param {string} userId
 * @returns {Promise<void>} 
 */
export async function deleteUser(userId) {
    const db = await getDB();
    await db.run(`DELETE FROM users WHERE userId = ?`, userId);
    await db.run(`DELETE FROM verifications WHERE userId = ?`, userId);
    await db.run(`DELETE FROM conversations WHERE userId = ?`, userId);
    await db.run(`DELETE FROM messages WHERE convId IN (SELECT convId FROM conversations WHERE userId = ?)`, userId);
    await db.run(`DELETE FROM message_parents WHERE childId IN (SELECT msgId FROM messages WHERE convId IN (SELECT convId FROM conversations WHERE userId = ?))`, userId);
}


/**
 * Check if the user is verified
 * @param {string} userId 
 * @returns {boolean} 
 */
export async function isVerified(userId) {
    const db = await getDB();
    const user = await db.get(`SELECT isVerified FROM users WHERE userId = ?`, userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user.isVerified === 1;
}

/**
 * Set the user as verified and remove the verification code
 * @param {string} userId 
 * @returns {boolean} true if the user was verified successfully
 */
export async function setUserVerified(userId) {
    const db = await getDB();
    const res = await db.run(`UPDATE users SET isVerified = 1 WHERE userId = ?`, userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
    await db.run(`DELETE FROM verifications WHERE userId = ?`, userId);
    return true;
}

/**
 * Get the verification code for a user, or generate a new one if it doesn't exist
 * @param {string} userId 
 * @returns {Promise<string>} 
 */
export async function getUserVerificationCode(userId) {
    const db = await getDB();
    const verification = await db.get(`SELECT code FROM verifications WHERE userId = ?`, userId);
    if (!verification) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await db.run(`INSERT INTO verifications (userId, code) VALUES (?, ?)`, userId, code);
        return code;
    };
    return verification.code;
}

/**
 * Get a user by their ID
 * @param {string} userId
 * @return {Promise<{ userId: string, name: string, email: string, password: string, preferences: Object, isVerified: boolean> } | undefined>}
 */
export async function getUserById(userId) {
    const db = await getDB();
    const userRow = await db.get(`SELECT * FROM users WHERE userId = ?`, userId);
    if (!userRow) return undefined;
    return {
        userId: userRow.userId,
        name: userRow.name,
        email: userRow.email,
        password: userRow.password,
        preferences: JSON.parse(userRow.preferences || '{}'),
        isVerified: userRow.isVerified === 1,
    };
}

/**
 * 
 * @param {string} userId 
 * @returns {Promise<{ name: string, email: string, preferences: Object }>}
 */
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

/**
 * 
 * @param {string} email 
 * @returns {Promise<{ userId: string, name: string, email: string, password: string, preferences: Object, isVerified: boolean> } | undefined>}
 */
export async function getUserByMail(email) {
    const db = await getDB();
    const userRow = await db.get(`SELECT * FROM users WHERE email = ?`, email);
    if (!userRow) return undefined;
    return {
        userId: userRow.userId,
        name: userRow.name,
        email: userRow.email,
        password: userRow.password,
        preferences: JSON.parse(userRow.preferences || '{}'),
        isVerified: userRow.isVerified === 1,
    };
}

/**
 * 
 * @param {string} userId 
 * @returns {Promise<{ keyId: string, key: string, api: string, date: string }[]>}
 */
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

/**
 * 
 * @param {string} userId 
 * @param {string} api_name 
 * @returns {Promise<{ keyId: string, key: string, date: string } | undefined>}
 */
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

/**
 * 
 * @param {string} userId 
 * @param {string} encrypted_key 
 * @param {string} api_name 
 * @returns {Promise<void>}
 */
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

/**
 * 
 * @param {string} userId 
 * @param {string} api_name
 * @returns {Promise<void>} 
 */
export async function deleteKey(userId, api_name) {
    const db = await getDB();
    const res = await db.run(`DELETE FROM keys WHERE userId = ? AND api = ?`, userId, api_name);
    if (res.changes === 0) throw new Error('Clé non trouvée');
}

/**
 * 
 * @param {string} userId 
 * @param {string} newName
 * @returns {Promise<void>} 
 */
export async function updateUserName(userId, newName) {
    const db = await getDB();
    const res = await db.run(`UPDATE users SET name = ? WHERE userId = ?`, newName, userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
}

/**
 * 
 * @param {string} userId 
 * @param {string} newEmail
 * @returns {Promise<void>}
 */
export async function updateUserMail(userId, newEmail) {
    const db = await getDB();
    const existingUser = await getUserByMail(newEmail);
    if (existingUser && existingUser.userId !== userId) {
        throw new Error('Email déjà utilisé par un autre utilisateur');
    }
    const res = await db.run(`UPDATE users SET email = ? WHERE userId = ?`, newEmail, userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
    await db.run(`UPDATE users SET isVerified = 0 WHERE userId = ?`, userId);
}

/**
 * 
 * @param {string} userId 
 * @param {string} newHashedPassword 
 * @returns {Promise<void>}
 */
export async function updateUserPassword(userId, newHashedPassword) {
    const db = await getDB();
    const res = await db.run(`UPDATE users SET password = ? WHERE userId = ?`, newHashedPassword, userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
}

/**
 * 
 * @param {string} userId 
 * @param {string} newPreferences 
 * @returns {Promise<void>}
 */
export async function updateUserPreferences(userId, newPreferences) {
    const db = await getDB();
    const res = await db.run(`UPDATE users SET preferences = ? WHERE userId = ?`, JSON.stringify(newPreferences), userId);
    if (res.changes === 0) throw new Error('Utilisateur non trouvé');
}

// --- CONVERSATIONS ---

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} convName 
 * @param {string} date 
 * @param {string} token 
 * @returns {Promise<string>} convId
 */
export async function addConversation(userId, convId, convName, date = new Date().toISOString(), token = 0) {
    const db = await getDB();
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

/**
 * 
 * @param {string} userId 
 * @returns {Promise<{ convId: string, convName: string, date: string, token: number, messages: Promise<Graph>}[]>}
 */
export async function getUserConversations(userId) {
    const db = await getDB();
    const convRows = await db.all(`SELECT * FROM conversations WHERE userId = ? ORDER BY date DESC`, userId);

    return convRows.map(async c => ({
        convId: c.convId,
        convName: c.convName,
        date: c.date,
        token: c.token,
        messages: await getAllMessagesGraph(userId, c.convId)
    }));
}


/**
 * Get only the metadata of the conversations of a user (used for listing conversations)
 * @param {string} userId 
 * @returns {Promise<{ convId: string, convName: string, date: string }[]>}
 */
export async function getUserConversationsMetadata(userId) {
    const db = await getDB();
    return db.all(`SELECT convId, convName, date FROM conversations WHERE userId = ? ORDER BY date DESC`, userId);
}

/**
 * Get the full conversation content (including messages) (used for displaying a conversation)
 * @param {string} userId 
 * @param {string} convId 
 * @returns {Promise<{ convId: string, convName: string, date: string, token: number, messages: Graph }>}
 */
export async function getConversationById(userId, convId) {
    const db = await getDB();
    const conv = await db.get(`SELECT * FROM conversations WHERE userId = ? AND convId = ?`, userId, convId);
    if (!conv) throw new Error('Conversation non trouvée');

    return {
        convId: conv.convId,
        convName: conv.convName,
        date: conv.date,
        token: conv.token,
        messages: await getAllMessagesGraph(userId, convId)
    };
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId
 * @returns {Promise<void>}
 */
export async function deleteConversation(userId, convId) {
    const db = await getDB();
    await db.run(`DELETE FROM messages WHERE convId = ?`, convId);
    await db.run(`DELETE FROM message_parents WHERE childId IN (SELECT msgId FROM messages WHERE convId = ?)`, convId);
    const res = await db.run(`DELETE FROM conversations WHERE userId = ? AND convId = ?`, userId, convId);
    if (res.changes === 0) throw new Error('Conversation non trouvée');
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} newName 
 * @return {Promise<void>}
 */
export async function changeConversationName(userId, convId, newName) {
    const db = await getDB();
    const res = await db.run(`UPDATE conversations SET convName = ? WHERE userId = ? AND convId = ?`, newName, userId, convId);
    if (res.changes === 0) throw new Error('Conversation non trouvée');
}

/**
 * @param {string} userId
 * @param {string} convId
 * @param {number} tokenToAdd
 * @returns {Promise<void>}
 */
export async function addToken(userId, convId, tokenToAdd) {
    const db = await getDB();
    await db.run(`
    UPDATE conversations
    SET token = token + ?
    WHERE userId = ? AND convId = ?
  `, tokenToAdd, userId, convId);
}


// --- MESSAGES ---


/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string[]} parentId // for the first message, this should be [], else it should be the msg answering to 
 * @param {string} role 
 * @param {string} content 
 * @param {string} author 
 * @param {string} timestamp 
 * @param {number} token 
 * @param {number} historyTokens 
 * @return {Promise<void>}
 */
export async function addMessage(userId, convId, msgId, parentId, role, content, author, timestamp = new Date().toISOString(), token = 0, historyTokens = 0) {
    const db = await getDB();
    await getConversationById(userId, convId); // Ensure the conversation exists

    await db.run(`
        INSERT INTO messages (msgId, convId, role, author, content, timestamp, token, historyTokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        msgId,
        convId,
        role,
        author,
        content,
        timestamp,
        token,
        historyTokens
    );
    await db.run(`UPDATE conversations SET date = ? WHERE convId = ?`, timestamp, convId);
    if (parentId && parentId.length > 0) {
        for (const parent of parentId) {
            await db.run(`
                INSERT INTO message_parents (childId, parentId) VALUES (?, ?)`, msgId, parent
            );
        }
    }
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @returns {Promise<Message>}
 */
export async function getMessageById(userId, convId, msgId) {
    const db = await getDB();

    const message = await db.get(`
        SELECT m.*
        FROM messages m
        JOIN conversations c ON m.convId = c.convId
        WHERE m.msgId = ? AND m.convId = ? AND c.userId = ?`, msgId, convId, userId);
    if (!message) throw new Error('Message non trouvé');

    return message;
}

/**
 * Get the parents of a message
 * @param {string} userId
 * @param {string} msgId
 * @return {Promise<Message[]>}
 */
export async function getMessageParents(userId, msgId) {
    const db = await getDB();
    const parents = await db.all(`
        SELECT m.*
        FROM message_parents mp
        JOIN messages m ON mp.parentId = m.msgId
        JOIN conversations c ON m.convId = c.convId
        WHERE mp.childId = ? AND c.userId = ?`, msgId, userId);
    return parents;
}

/**
 * Return the messages of a conversation with the graph structure encoded in an object
 * @param {string} convId
 * @return {Promise<Graph>}
 */
export async function getAllMessagesGraph(convId) {
    const db = await getDB();

    const messages = await db.all(`SELECT * FROM messages WHERE convId = ? ORDER BY timestamp ASC`, convId);

    const relations = await db.all(`
        SELECT * FROM message_parents WHERE childId IN (
        SELECT msgId FROM messages WHERE convId = ?)`, convId);

    const graph = {};
    const childrenMap = {}; // { parentId: [childId1, childId2, ...] }
    const parentMap = {}; // { childId: [parentId1, parentId2, ...] }

    for (const rel of relations) {
        if (!parentMap[rel.childId]) parentMap[rel.childId] = [];
        if (!childrenMap[rel.parentId]) childrenMap[rel.parentId] = [];

        parentMap[rel.childId].push(rel.parentId);
        childrenMap[rel.parentId].push(rel.childId);
    }

    const rootId = [];

    for (const msg of messages) {
        graph[msg.msgId] = {
            message: msg,
            parents: parentMap[msg.msgId] || [],
            children: childrenMap[msg.msgId] || []
        };

        if (graph[msg.msgId].parents.length === 0) {
            rootId.push(msg.msgId);
        }
    }

    return {
        rootId,
        messagesMap: graph
    }
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent
 * @return {Promise<void>} 
 */
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

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId
 * @returns {Promise<void>} 
 */
export async function deleteMessage(userId, convId, msgId) {
    const db = await getDB();
    await getMessageById(userId, convId, msgId);

    await db.run(`DELETE FROM messages WHERE msgId = ? AND convId = ?`, msgId, convId);
    await db.run(`DELETE FROM message_parents WHERE childId = ? OR parentId = ?`, msgId, msgId);
}

