/*

=================== Conversation endpoints ===================

> get /
    * just retrieve the conv list then send (no streaming needed)



> get /:convId
    * retrieve a specific conversation by ID then send (no streaming needed)


> post /
    * create a new conversation with conv.createConversation -> stream (convId, convName)
    * create the first user message with chatAPI.addUserMessage --> stream (msgId, token, content, author, timestamp)
    * generate a reply chatAPI.generateLinearHistoryForOneMessage and chatAPI.generateReply --> stream (1. (msgId, author) when msgId is generated, 2. (msgId, token, author) during the generation)
    * add the reply to the database with db.addMessage



> put /:convId
    * change the conversation name with conv.changeConversationName --> no streaming needed



> delete /:convId
    * delete the conversation with conv.deleteConversation --> no streaming needed



*/


/// <reference path="./types.js" />
import * as db from '../db/sqlite_interface.js';
import { generateReply } from './chatAPI_v2.js';
import { v4 as uuidv4 } from 'uuid';


/**
 * Get all conversation IDs, names, and dates for a user
 * (used to display the list of conversations in the UI)
 * @param {string} userId 
 * @returns {Promise<{convId: string,convName: string, date: string}[]>}
 */
export async function getConvList(userId) {
    const convMetadatas = await db.getUserConversationsMetadata(userId);
    if (!convMetadatas) {
        console.error(`Error browsing conversations for user ${userId}:`, err);
        throw new Error('Conversations not found');
    }
    return convMetadatas;
}


/**
 * Retrive a conversation by its ID usefull to display the conversation in the UI
 * @param {string} convId 
 * @returns {Promise<Graph>}
 */
export async function getConversationById(convId) {
    return await db.getAllMessagesGraph(convId);
}


/**
 * 
 * @param {string} userId 
 * @param {string} content 
 * @param {string} modelName
 * @return {Promise<{convId: string, convName: string}>}
 */
export async function createConversation(userId, content, modelName) {
    // TODO

    const convId = uuidv4();

    const createConvPrompt = `
### Role 
Your are a title generator LLM, you generate a title for a conversation based on the first user message.

### Context
The user has sent the following message : "${content}"

### Task
Generate a title for the conversation based on the user message.

### Output Guidelines
- Return raw text without any formatting
- The title should be concise (less than 10 words)
- The title should be relevant to the user message
- Choose the language  accordingly to the user message

`

    const createConvHistory = [{ role: 'user', content: createConvPrompt }];

    const replies = await generateReply(userId, convId, createConvHistory, [modelName], null, null)

    await db.addConversation(
        userId,
        convId,
        replies[modelName].content,
        replies[modelName].timestamp,
        replies[modelName].token
    )

    return { convId, convName: replies[modelName].content }
}




/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} newName 
 */
export async function changeConversationName(userId, convId, newName) {
    await db.changeConversationName(userId, convId, newName)
}


/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 */
export async function deleteConversation(userId, convId) {
    try {
        await db.deleteConversation(userId, convId);
    }
    catch (err) {
        throw new Error('Conversation not found');
    }
}