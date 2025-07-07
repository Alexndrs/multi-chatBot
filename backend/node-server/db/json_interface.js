import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

export function readDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

export function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// === INTERFACE PUBLIQUE ===

/**
 * @typedef {Object} userObject
 * @property {string} userId 
 * @property {Object} userInfo
 * @property {string} userInfo.name
 * @property {string} userInfo.email
 * @property {string} userInfo.password
 * @property {Object} userInfo.preferences
 * @property {Array<conversationObject>} conversations
 */

/**
 * @typedef {Object} conversationObject
 * @property {string} convId
 * @property {string} convName
 * @property {string} date
 * @property {number} token
 */

/**
 * @typedef {Object} messageObject
 * @property {string} msgId
 * @property {string} role
 * @property {string} content
 * @property {string} timestamp
 * @property {number} token
 */



/**
 * 
 * @param {string} userId 
 * @returns {userObject | undefined}
 */
export function getUserById(userId) {
    const db = readDB();
    return db.users.find(u => u.userId === userId);
}

export function getUserInfo(userId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");
    return {
        name: user.userInfo.name,
        email: user.userInfo.email,
        preferences: user.userInfo.preferences
    };
}

/**
 * 
 * @param {string} email 
 * @returns {userObject | undefined}
 */
export function getUserByMail(email) {
    const db = readDB();
    return db.users.find(u => u.userInfo.email === email);
}


/**
 * 
 * @param {userObject} user
 */
export function addUser(user) {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {Object} updatedInfo (.e.g. { name: "New Name", email: ")
 */
export function updateUser(userId, updatedInfo) {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) throw new Error("Utilisateur non trouvé");

    db.users[userIndex] = { ...db.users[userIndex], ...updatedInfo };
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @returns Array<conversationObject>
 */
export function getUserConversations(userId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    return user.conversations;
}

/**
 * 
 * @param {string} userId 
 * @returns Array<string>
 */

export function getUserConversationsIdAndNameAndDate(userId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    return user.conversations.map(c => ({
        convId: c.convId,
        convName: c.convName,
        date: c.date
    }));
}
/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @returns 
 */
export function getConversationById(userId, convId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conversation = user.conversations.find(c => c.convId === convId);
    if (!conversation) throw new Error("Conversation non trouvée avec l'id :", convId);

    return conversation;
}

/**
 * 
 * @param {string} userId 
 * @param {conversationObject} conversation 
 */
export function addConversation(userId, conversation) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    user.conversations.push(conversation);
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 */
export function deleteConversation(userId, convId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const convIndex = user.conversations.findIndex(c => c.convId === convId);
    if (convIndex === -1) throw new Error("Conversation non trouvée");

    user.conversations.splice(convIndex, 1);
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} newName 
 */
export function changeConversationName(userId, convId, newName) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    conv.convName = newName;
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} token 
 */
export function addToken(userId, convId, token) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    conv.token = conv.token + token;
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @returns {messageObject | undefined}
 */

export function getMessageById(userId, convId, msgId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    const message = conv.msgList.find(m => m.msgId === msgId);
    if (!message) throw new Error("Message non trouvé");

    return message;
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @returns {Array<messageObject>}
 */
export function getAllMessages(userId, convId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    return conv.msgList;
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {messageObject} message 
 * @returns {string} msgId
 */
export function addMessage(userId, convId, message) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);

    if (!conv) throw new Error("Conversation non trouvée");

    conv.msgList.push({
        msgId: message.msgId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        token: message.token || 0,
        historyTokens: message.historyTokens || 0
    });

    conv.date = new Date().toISOString();

    writeDB(db);
    return message.msgId
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent 
 */
export function editMessage(userId, convId, msgId, newContent) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    const message = conv.msgList.find(m => m.msgId === msgId);
    if (!message) throw new Error("Message non trouvé");

    message.content = newContent;
    message.data = new Date().toISOString();
    conv.date = new Date().toISOString();
    writeDB(db);
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 */
export function deleteMessage(userId, convId, msgId) {
    const db = readDB();
    const user = db.users.find(u => u.userId === userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const conv = user.conversations.find(c => c.convId === convId);
    if (!conv) throw new Error("Conversation non trouvée");

    const messageIndex = conv.msgList.findIndex(m => m.msgId === msgId);
    if (messageIndex === -1) throw new Error("Message non trouvé");

    conv.msgList.splice(messageIndex, 1);
    writeDB(db);
}