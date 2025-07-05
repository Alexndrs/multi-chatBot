import fs from 'fs';
import path from 'path';
import * as chatAPI from './chatAPI';
import * as db from '../db/interface';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/db.json');

// Reset de la base entre chaque test
function resetDB() {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2), 'utf-8');
}

// Petite fonction d'assertion simple
function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
}

// Fonction de test complète
async function runChatAPITests() {
    resetDB();

    const mail = "user@example.com";
    const name = "Test User";
    const pass = "hashed_password";

    console.log("➡️ createUser: Création d'un utilisateur");
    const user = await chatAPI.createUser(mail, name, pass);
    assert(user.userInfo.name === name, "Nom incorrect");
    assert(db.getUserById(user.userId), "Utilisateur non ajouté");

    console.log("➡️ createUser: Email déjà utilisé");
    try {
        await chatAPI.createUser(mail, "New User", "123");
        throw new Error("Création d'utilisateur en doublon non bloquée");
    } catch (e) {
        assert(e.message === "Email already exists", "Erreur inattendue sur email existant");
    }

    console.log("➡️ createConversation: Création d'une nouvelle conversation avec message");
    await chatAPI.createConversation(user.userId, "Bonjour, peux-tu m'aider ?");
    const userData = db.getUserById(user.userId);
    assert(userData.conversations.length === 1, "Conversation non ajoutée");
    assert(userData.conversations[0].msgList.length >= 2, "Messages manquants");

    const convId = userData.conversations[0].convId;

    console.log("➡️ handleMessage: Ajout d'un message dans conversation existante");
    await chatAPI.handleMessage(user.userId, convId, "Merci !");
    const updatedConv = db.getConversationById(user.userId, convId);
    assert(updatedConv.msgList.length >= 4, "handleMessage n'a pas ajouté les messages");

    console.log("➡️ changeConversationName: Renommage de la conversation");
    chatAPI.changeConversationName(user.userId, convId, "Nouveau nom");
    const renamed = db.getConversationById(user.userId, convId);
    assert(renamed.convName === "Nouveau nom", "Nom de conversation non mis à jour");

    console.log("➡️ editMessage: Modification avec suppression postérieure");
    const toEdit = renamed.msgList.find(m => m.role === 'user');
    await chatAPI.editMessage(user.userId, convId, toEdit.msgId, "Contenu modifié");
    const editedConv = db.getConversationById(user.userId, convId);

    const lastUserMsg = editedConv.msgList[editedConv.msgList.length - 2];
    assert(lastUserMsg.content === "Contenu modifié", "Message non modifié");

    console.log("➡️ deleteConversation: Suppression d'une conversation");
    chatAPI.deleteConversation(user.userId, convId);
    assert(db.getUserById(user.userId).conversations.length === 0, "Conversation non supprimée");

    console.log("✅ Tous les tests chatAPI sont passés avec succès.");
}

runChatAPITests();
