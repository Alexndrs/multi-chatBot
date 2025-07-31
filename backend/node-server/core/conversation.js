/*

/Conversation router :
    > get /list :
        -> getConvList


    > get /:convId :
    ---- params contain the convId
        -> getConversationById


    > post
    ---- body contain the userId, content, modelName
        -> generate convId
        -> generate convName using generateReply without streaming
        -> add conversation to the database using db.addConversation
        -> return conversation metadata (convId, convName)
        // Then frontend will post a message/reply to add the first reply message to the conversation
    
    > delete /:convId :
    ---- params contain the convId
        -> deleteConversation using db.deleteConversation
    
    > put /:convId/name :
    ---- params contain the convId and body contain the newName
        -> changeConversationName using db.changeConversationName


*/


/// <reference path="./types.js" />
import * as db from '../db/sqlite_interface.js';


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
 */
export async function createConversation(userId, content, modelName) {
    // TODO
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