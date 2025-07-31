import * as auth from '../core/auth.js';
import * as db from '../db/sqlite_interface.js';
import * as conv from '../core/conversation.js';
import * as chatAPI from '../core/chatAPI_v2.js';


async function testIntegration() {
    await db.initDB();

    // Create a user
    const existingUser = await db.getUserByMail('testUser@mail.com');
    if (existingUser) {
        await db.deleteUser(existingUser.userId);
    }
    const { userId, token } = await auth.createUser('testUser@mail.com', 'Test User', 'hashedPassword', 'verificationCode');
    console.log(`User created with: \n\tid : ${userId}\n\ttoken: ${token}\n\n`);

    // Verify the user
    const verif = await auth.verifyUserCode(userId, 'verificationCode')
    console.log(`User verification status: ${verif}\n`);

    // Log in the user
    const loginResponse = await auth.loginUser('testUser@mail.com', 'hashedPassword');
    console.log(`User login reponse:\n\tuserId: ${loginResponse.userId}\n\ttoken: ${loginResponse.token}\n\n`);

    // Get user info
    const userInfo = await auth.getUserInfo(userId);
    console.log(`User info: \n\t${JSON.stringify(userInfo)}\n\n`);


    // Create a conversation pipeline : user ask a question : "donne moi une recette de cookies"

    const content = 'Salut comment tu tappelles ?';
    const models = ['qwen/qwen3-32b', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

    // Create a conversation
    const response = await conv.createConversation(userId, content, models[0]);
    console.log(`Conversation created with title :\n\t${response.convName}\n\t and Id :${response.convId} \n\n`);

    // Create the first message in the conversation
    const userMessage = await chatAPI.addUserMessage(userId, response.convId, [], content)
    console.log(`User message added :\n\t${JSON.stringify(userMessage)}\n\n`);

    // Generate a reply for the conversation
    const linearHistory = await chatAPI.generateLinearHistoryForOneMessage(response.convId, userMessage);
    console.log(`Linear history for the conversation:\n\t${JSON.stringify(linearHistory)}\n\n`);

    // const onToken = (token, modelName) => { console.log(`Token received from ${modelName}: ${token}`); };
    // const onContainer = (container, modelName) => {console.log(`Container received from ${modelName}: ${JSON.stringify(container)}`); };
    const reply = await chatAPI.generateReply(userId, response.convId, linearHistory, models, null, null);
    console.log(`Reply generated: \n\t${JSON.stringify(reply)}\n\n`);
}


testIntegration();