/*
Algorithms : 

___________________________________________________
addUserMessage
params :
userId, convId, parentId (=[] if first message), content
-------------
    // 1. generate a message object and insert it into the database

    // 2. send back the message object to the client


___________________________________________________
generateReply
params : 
userId, convId, linearHistory, modelNames, onToken, onIdGenerated
-------------

    // 1. apply context window to the linear history to fit the models's context length

    // 2. generate multiple id and messages container for each model in modelNames and send it to client with onIdGenerated

    // 3. for each model in modelNames, call the corresponding chat function with the linear history and the model name and stream the response with onToken


___________________________________________________
chooseReply
params :
userId, convId, chosenMessageId
-------------
    // 1. get the message with the chosenMessageId from the database

    // 2. backtrack the parents of the message until the first node with multiple children and delete all the other children of this node


___________________________________________________
generateLinearHistoryForOneMessage
params :
convId, inputMessage
-------------
    // 1. generate a linear history using dfs starting from inputMessage.msgId, transiting with the parents and stopping at the first root message. For parent choosing the first one in the array (arbitrary choice).


___________________________________________________
generateLinearHistoryForMultipleMessages
params :
convId, inputMessages
-------------
    // 1. generate a linear history that contains only the inputMessages well ordoned and a good merging prompt


___________________________________________________
editUserMessage
params :
convId, msgId, newContent, modelNames, onToken, onIdGenerated
-------------
    // 1. do a dfs an delete all the children of the message with msgId (need to retrive the graph first)

    // 2. update the content of the message with msgId in the database (db.updateMessageContent)

    // 3. generate a new container for the new reply and send it to the client with onIdGenerated (at this point the client will remove the old message and add the new container in the UI)

    // 4. generate and stream a new reply using the generateReply function with the updated linear history and the selected modelNames


___________________________________________________
regenerateReply
params :
convId, msgId, onToken, modelNames, onToken, onIdGenerated
-------------
    // 1. do a dfs an delete all the children of the message with msgId (need to retrive the graph first)

    // 2. construct the linear history of parent of message using generateLinearHistoryForOneMessage

    // 3. generate a new container for the new reply and send it to the client with onIdGenerated (at this point the client will remove the old message and add the new container in the UI)

    // 4. generate and stream a new reply using the generateReply function with the updated linear history and the selected modelNames


======================= ROUTES PIPELINE =========================




/Message router : 


    > post /reply : 
    ---- body contain the content to reply to and the parentId

        -> addUserMessage (and stream the message to the client)
        -> generateReply (and stream the response to the client (possibly multiple responses if multiple models are used))


    > post /merge :
    ---- body contain the input messages ids to merge and the modelName 

        -> getMessagesByIds
        -> generateLinearHistoryForMultipleMessages
        -> generateReply (and stream the response to the client (only one response since we merge the messages))
    

    > put /edit :
    ---- body contain the msgId, newContent, modelName

        -> editUserMessage (and stream the updates and the new reply to the client)


    > put /regenerate 
    ---- body contain the msgId, modelNames

        -> regenerateReply (and stream the updates and the new reply to the client)


*/




/// <reference path="./types.js" />
import 'dotenv/config';
import * as db from '../db/sqlite_interface.js';
import { chatWithGemini, chatWithGroq, chatWithOpenAI, chatWithMistral, chatWithClaude, testGroq, testGemini, testOpenAI, testMistral, testClaude } from '../services/api_providers.js';
// import { applySlidingWindow, getMaxTokenInput, models, apis } from '../services/utils.js';
// import { v4 as uuidv4 } from 'uuid';
// import { getKeyForApi } from './encryption.js';




/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} parentId 
 * @param {string} content
 * @return {Promise<Message>}
 */
export async function addUserMessage(userId, convId, parentId, content) {

}

/**
 * 
 * @param {string} convId 
 * @param {Message} inputMessage
 * @return {Promise<{role: "user" | "assistant", content: string}[]>}
 */
export async function generateLinearHistoryForOneMessage(convId, inputMessage) {

}

/**
 * 
 * @param {string} convId 
 * @param {Message[]} inputMessages
 * @return {Promise<{role: "user" | "assistant", content: string}[]>}
 */
export async function generateLinearHistoryForMultipleMessages(convId, inputMessages) {

}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {{role: "user" | "assistant", content: string}[]} linearHistory 
 * @param {string} modelNames 
 * @param {(token)=>promise<void>} onToken 
 * @param {({userContainer:Object, responseContainer:Object[]})=>{}} onIdGenerated
 * @return {Promise<void>}
 */
export async function generateReply(userId, convId, linearHistory, modelNames, onToken, onIdGenerated) {

}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} chosenMessageId
 * @return {Promise<void>} 
 */
export async function chooseReply(userId, convId, chosenMessageId) {

}

/**
 * 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent 
 * @param {string[]} modelNames
 * @param {(token:string)=>void} onToken 
 * @param {(msgContainer : Object)=>void} onIdGenerated
 * @return {Promise<void>}
 */
export async function editUserMessage(convId, msgId, newContent, modelNames, onToken, onIdGenerated) {

}
/**
 * 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent 
 * @param {string[]} modelNames
 * @param {(token:string)=>void} onToken 
 * @param {(msgContainer : Object)=>void} onIdGenerated
 * @return {Promise<void>}
 */
export async function regenerateReply(convId, msgId, onToken, modelNames, onToken, onIdGenerated) {

}