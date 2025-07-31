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
import { chatWithGemini, chatWithGroq, chatWithOpenAI, chatWithMistral, chatWithClaude, testGroq, testGemini, testOpenAI, testMistral, testClaude, computeTokenStats, systemPrompt } from '../services/api_providers.js';

import { v4 as uuidv4 } from 'uuid';
import { models, apis } from '../services/utils.js';
import { getKeyForApi } from './encryption.js';




/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string[]} parentId 
 * @param {string} content
 * @return {Promise<Message>}
 */
export async function addUserMessage(userId, convId, parentId, content) {
    const msgId = uuidv4();
    const message = {
        msgId,
        convId,
        role: 'user',
        author: userId,
        content,
        timestamp: new Date().toISOString(),
        token: 0,
        histoyToken: 0
    }
    await db.addMessage(
        userId,
        convId,
        msgId,
        parentId,
        message.role,
        message.content,
        message.author,
        message.timestamp,
        message.token,
        message.histoyToken
    )
    return message;
}

/**
 * 
 * @param {string} convId 
 * @param {Message} inputMessage
 * @return {Promise<{role: "user" | "assistant", content: string}[]>}
 */
export async function generateLinearHistoryForOneMessage(convId, inputMessage) {
    const graph = await db.getAllMessagesGraph(convId);
    let node = graph.messagesMap[inputMessage.msgId];
    const linearHistory = [];
    while (node) {
        // We kwnow the graph is acyclic so we can safely traverse it without worrying about cycles
        linearHistory.unshift({
            role: node.message.role,
            content: node.message.content
        });
        if (node.parents.length === 0) {

            break; // Reached the root message
        }
        // Choose the first parent (arbitrary choice)
        node = graph.messagesMap[node.parents[0]];
    }
    return linearHistory;
}

/**
 * 
 * @param {string} convId 
 * @param {Message[]} inputMessages
 * @return {Promise<{role: "user" | "assistant", content: string}[]>}
 */
export async function generateLinearHistoryForMultipleMessages(convId, inputMessages) {
    if (inputMessages.length === 0) {
        throw new Error('No input messages provided');
    }

    if (inputMessages.length === 1) {
        return generateLinearHistoryForOneMessage(convId, inputMessages[0]);
    }

    /*
    
    In this case the graph should have the exacte following structure (if we have 3 input messages for example) :


                        |
                [common Prompt]
                /      |      \
               /       |       \
            [msg1]   [msg2]  [msg3]
              \        |       /
               \       |      /
                \      |     /
                 [merge TODO]

    so we can get the common prompt by getting the first parent of the first message msg1
    
    */


    const graph = await db.getAllMessagesGraph(convId);
    const node = graph.messagesMap[inputMessages[0].msgId];
    if (!node || !node.parents.length === 1) {
        throw new Error('Input messages do not have a common parent');
    }

    const parentNode = graph.messagesMap[node.parents[0]];
    if (!parentNode || parentNode.parents.length !== inputMessages.length) {
        throw new Error('Input messages do not have a common parent with the expected number of children');
    }

    const formattedResponses = inputMessages
        .map(msg => `[${msg.author}]:\n${msg.content}`)
        .join('\n\n');


    const question = parentNode.message.content;

    const mergePrompt = `
### Role
You are a specialized aggregator LLM. Your job is to synthesize independent responses into one enriched, coherent, and logically structured answer.

### Context
All contributors responded to the same question:

"${question}"

### Raw Contributor Responses
${formattedResponses}

### Task
1. Identify the unique strengths and key ideas from each author.
2. Merge them into a single, high-quality response that:
   - fully answers the original question,
   - integrates all relevant and complementary points,
   - resolves or harmonizes differences in tone or content.

### Output Guidelines
- Start with a short intro that reframes the question and your objective.
- Then present the merged answer using smooth transitions (e.g., "In addition", "However", "Another perspective…").
- End with a concise conclusion.
- Keep the tone clear, neutral, and professional.
- Do not simply summarize. Actively rephrase and integrate.
`;


    return [
        { role: 'user', content: mergePrompt },
    ];
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {{role: "user" | "assistant", content: string}[]} linearHistory
 * @param {string} modelNames 
 * @param {(token:string,modelName:string)=>promise<void>} onToken 
 * @param {(Record<string, Message>)=>promise<void>} onIdGenerated
 * @return {Promise<Record<string, Message>>}
 */
export async function generateReply(userId, convId, linearHistory, modelNames, onToken, onIdGenerated) {

    // TODO later : apply context window to the linear history to fit the models's context length

    // Generate id and messages container for each model in modelNames and stream it

    const replyContainers = {};
    modelNames.forEach(modelName => {
        const msgId = uuidv4();
        const replyContainer = {
            msgId,
            convId,
            role: 'assistant',
            author: modelName,
            content: '',
            timestamp: new Date().toISOString(),
            token: 0,
            historyToken: 0
        };
        replyContainers[modelName] = replyContainer;
    });
    if (onIdGenerated) onIdGenerated(replyContainers);

    // Generate content for each model in modelNames and stream the response
    const tasks = modelNames.map(async (modelName) => {
        const apiName = models[modelName]?.api;
        if (!apiName) throw new Error(`Model ${modelName} is not supported`);

        const key = (await getKeyForApi(userId, apiName))?.key;
        if (!key && !apis[apiName].isFree) throw new Error(`API key for ${apiName} is required`);

        let generatedText = '';
        let completionTokens = 0;

        // Clone linearHistory to avoid modifying the original array (especially important because we add a prompt system which is different for each model)
        const clonedHistory = linearHistory.map(item => ({ ...item }));

        switch (apiName) {
            case 'groq':
                ({ generatedText, completionTokens } = await chatWithGroq(clonedHistory, onToken, modelName, key)); break;
            case 'gemini':
                ({ generatedText, completionTokens } = await chatWithGemini(clonedHistory, onToken, modelName, key)); break;
            case 'openai':
                ({ generatedText, completionTokens } = await chatWithOpenAI(clonedHistory, onToken, modelName, key)); break;
            case 'mistral':
                ({ generatedText, completionTokens } = await chatWithMistral(clonedHistory, onToken, modelName, key)); break;
            case 'claude':
                ({ generatedText, completionTokens } = await chatWithClaude(clonedHistory, onToken, modelName, key)); break;
            default: throw new Error(`API ${apiName} is not supported`);
        }

        const container = replyContainers[modelName];
        container.content = generatedText;
        container.token = completionTokens;
        container.historyToken = completionTokens;

        return container;
    });

    const finishedContainers = await Promise.all(tasks);
    return finishedContainers.reduce((acc, container) => {
        acc[container.author] = container;
        return acc;
    }, {});
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
export async function regenerateReply(convId, msgId, newContent, modelNames, onToken, onIdGenerated) {

}