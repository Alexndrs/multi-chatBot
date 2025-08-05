import * as auth from '../core/auth.js';
import * as db from '../db/sqlite_interface.js';
import * as conv from '../core/conversation.js';
import * as chatAPI from '../core/chatAPI_v2.js';
import { generateMermaidGraph } from '../services/utils.js';


async function testFullWorkflow() {
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


    // Create a conversation pipeline : user ask a question : "comment tu t'appelles ?"

    const content = "Salut comment tu t'appelles ?";
    const models = ['gemma2-9b-it', 'llama-3.1-8b-instant'];

    // Create a conversation
    const convo = await conv.createConversation(userId, content, models[0]);
    console.log(`Conversation created with title :\n\t${convo.convName}\n\t and Id :${convo.convId} \n\n`);

    // Create the first message in the conversation
    const userMessage = await chatAPI.addUserMessage(userId, convo.convId, [], content)
    console.log(`User message added :\n\t${JSON.stringify(userMessage)}\n\n`);

    // Generate a reply for the conversation
    const linearHistory = await chatAPI.generateLinearHistoryForOneMessage(convo.convId, userMessage.msgId);
    console.log(`Linear history for the conversation:\n\t${JSON.stringify(linearHistory)}\n\n`);

    // const onToken = (token, modelName) => { console.log(`Token received from ${modelName}: ${token}`); };
    // const onContainer = (container, modelName) => {console.log(`Container received from ${modelName}: ${JSON.stringify(container)}`); };
    const reply = await chatAPI.generateReply(userId, convo.convId, linearHistory, models, null, null);
    console.log(`Reply generated: \n\t${JSON.stringify(reply)}\n\n`);

    // Add the reply to the database
    for (const modelName in reply) {
        const message = reply[modelName];
        await db.addMessage(userId, message.convId, message.msgId, [userMessage.msgId], message.role, message.content, message.author, message.timestamp, message.token, message.historyToken);
    }


    // Now merging the responses from just several msgIds and the convId and a modelName

    const convId = convo.convId;
    const msgIds = Object.keys(reply).map(modelName => reply[modelName].msgId);
    const mergeModel = models[0];

    const messages = await Promise.all(msgIds.map(msgId => db.getMessageById(userId, convId, msgId)));

    const linearHistoryForMerge = await chatAPI.generateLinearHistoryForMultipleMessages(convId, messages)

    // console.log(`Linear history for merging messages: \n\t${ JSON.stringify(linearHistoryForMerge) } \n\n`);
    const mergeReply = await chatAPI.generateReply(userId, convId, linearHistoryForMerge, [mergeModel], null, null);
    console.log(`Merged reply generated: \n\t${JSON.stringify(mergeReply)} \n\n`);

    // Add the merged reply to the database
    const mergedMessage = mergeReply[mergeModel];
    await db.addMessage(userId, mergedMessage.convId, mergedMessage.msgId, msgIds, mergedMessage.role, mergedMessage.content, mergedMessage.author, mergedMessage.timestamp, mergedMessage.token, mergedMessage.historyToken);



    // User ask a follow-up question with the same models
    const followUpContent = "Donne moi la formule de l'eau";
    const followUpMessage = await chatAPI.addUserMessage(userId, convo.convId, [mergedMessage.msgId], followUpContent);
    const followUpLinearHistory = await chatAPI.generateLinearHistoryForOneMessage(convo.convId, followUpMessage.msgId);
    console.log(`Linear history for the follow-up message:\n\t${JSON.stringify(followUpLinearHistory)}\n\n`);
    const followUpReply = await chatAPI.generateReply(userId, convo.convId, followUpLinearHistory, models, null, null);
    for (const modelName in followUpReply) {
        const message = followUpReply[modelName];
        await db.addMessage(userId, message.convId, message.msgId, [followUpMessage.msgId], message.role, message.content, message.author, message.timestamp, message.token, message.historyToken);
    }

    let graph = await db.getAllMessagesGraph(convo.convId);
    let markdown = generateMermaidGraph(graph);
    console.log(`Mermaid graph for the conversation:\n\t${markdown}\n\n`);



    // Now just keep the answer from the first model
    await chatAPI.chooseReply(userId, convo.convId, followUpReply[models[0]].msgId);




    // graph = await db.getAllMessagesGraph(convo.convId);
    // markdown = generateMermaidGraph(graph);
    // console.log(`Mermaid graph for the conversation:\n\t${markdown}\n\n`);



    // Let's edit the second user message in the conversation

    const newContent = "Comment on dit bonjour en portugais ?";
    await chatAPI.editUserMessage(userId, convo.convId, followUpMessage.msgId, newContent, models, null, null);

    // graph = await db.getAllMessagesGraph(convo.convId);
    // markdown = generateMermaidGraph(graph);
    // console.log(`Mermaid graph for the conversation:\n\t${markdown}\n\n`);


    // Let's regenerate the reply of gemma to the name question with model gemini-2.5-flash
    await chatAPI.regenerateReply(userId, convo.convId, reply[models[0]].msgId, 'gemini-2.5-flash', null, null);


    graph = await db.getAllMessagesGraph(convo.convId);
    markdown = generateMermaidGraph(graph);
    console.log(`Mermaid graph for the conversation:\n\t${markdown}\n\n`);

}


testFullWorkflow();