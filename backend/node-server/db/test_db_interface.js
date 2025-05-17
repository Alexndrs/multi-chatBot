
const fs = require('fs');
const path = require('path');
const db = require('../db/interface'); // adapte le chemin selon ton projet
const dbPath = path.join(__dirname, '../db/db.json');

function resetDB() {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2), 'utf-8');
}

function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
}

function runTests() {
    resetDB();
    const userId = 'user-123';
    const convId = 'conv-456';
    const msgId = 'msg-789';

    const user = {
        userId,
        userInfo: {
            name: "Test User",
            email: "test@example.com",
            password: "hashedpwd",
            preferences: {}
        },
        conversations: []
    };

    console.log("➡️ Test: addUser & getUserById");
    db.addUser(user);
    let fetchedUser = db.getUserById(userId);
    assert(fetchedUser.userInfo.email === "test@example.com", "getUserById failed");

    console.log("➡️ Test: updateUser");
    db.updateUser(userId, {
        userInfo: {
            ...fetchedUser.userInfo,
            name: "Updated Name"
        }
    });
    fetchedUser = db.getUserById(userId);
    assert(fetchedUser.userInfo.name === "Updated Name", "updateUser failed");

    console.log("➡️ Test: addConversation & getConversationById");
    db.addConversation(userId, {
        convId,
        convName: "Test Conversation",
        msgList: []
    });
    const conversation = db.getConversationById(userId, convId);
    assert(conversation.convName === "Test Conversation", "add/getConversation failed");

    console.log("➡️ Test: getUserConversations");
    const allConvs = db.getUserConversations(userId);
    assert(allConvs.length === 1, "getUserConversations failed");

    console.log("➡️ Test: addMessage & getMessageById");
    db.addMessage(userId, convId, {
        msgId,
        role: "user",
        content: "Hello World",
        timestamp: new Date().toISOString()
    });
    const message = db.getMessageById(userId, convId, msgId);
    assert(message.content === "Hello World", "addMessage/getMessageById failed");

    console.log("➡️ Test: getAllMessages");
    const messages = db.getAllMessages(userId, convId);
    assert(messages.length === 1, "getAllMessages failed");

    console.log("➡️ Test: editMessage");
    db.editMessage(userId, convId, msgId, "Edited Content");
    const edited = db.getMessageById(userId, convId, msgId);
    assert(edited.content === "Edited Content", "editMessage failed");

    console.log("➡️ Test: deleteMessage");
    db.deleteMessage(userId, convId, msgId);
    try {
        db.getMessageById(userId, convId, msgId);
        throw new Error("deleteMessage failed - message still exists");
    } catch (e) {
        assert(e.message === "Message non trouvé", "deleteMessage error not thrown");
    }

    console.log("➡️ Test: deleteConversation");
    db.deleteConversation(userId, convId);
    try {
        db.getConversationById(userId, convId);
        throw new Error("deleteConversation failed - conversation still exists");
    } catch (e) {
        assert(e.message === "Conversation non trouvée", "deleteConversation error not thrown");
    }

    console.log("✅ Tous les tests ont passé avec succès.");
}

runTests();
