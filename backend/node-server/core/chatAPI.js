import 'dotenv/config';
import { chatWithGemini, chatWithGroq, chatWithOpenAI, chatWithMistral, chatWithClaude, testGroq, testGemini, testOpenAI, testMistral, testClaude } from '../services/api_providers.js';
import { applySlidingWindow, getMaxTokenInput, models, apis } from '../services/utils.js';
import * as db from '../db/sqlite_interface.js';
import { v4 as uuidv4 } from 'uuid';
import { getKeyForApi } from './encryption.js';

export async function getAllConvIdsAndNameAndDate(userId) {
    const convIdsAndName = await db.getUserConversationsIdAndNameAndDate(userId);
    if (!convIdsAndName) {
        console.error(`Error browsing conversations for user ${userId}:`, err);
        throw new Error('Conversations not found');
    }
    return convIdsAndName;
}


export async function testKey(key, apiName) {
    let answer;
    switch (apiName) {
        case 'groq':
            answer = await testGroq(key); break;
        case 'gemini':
            answer = await testGemini(key); break;
        case 'openai':
            answer = await testOpenAI(key); break;
        case 'mistral':
            answer = await testMistral(key); break;
        case 'claude':
            answer = await testClaude(key); break;
        default: answer = { message: `API ${apiName} is not supported`, error: true };
    }
    return answer;
}


async function generateResponseForMessages({
    userId,
    convId,
    messages,
    userMsg,
    newMsg,
    onToken,
    onIdGenerated,
    model_name
}) {
    if (onIdGenerated) onIdGenerated(userMsg, newMsg);

    const apiName = models[model_name]?.api;
    if (!apiName) throw new Error(`Model ${model_name} is not supported`);


    const key = (await getKeyForApi(userId, apiName))?.key;
    if (!key && !apis[apiName].isFree) throw new Error(`API key for ${apiName} is required`);

    let generatedText, currentMessageTokens, historyTokens, completionTokens;
    switch (apiName) {
        case 'groq':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGroq(messages, onToken, model_name, key)); break;
        case 'gemini':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGemini(messages, onToken, model_name, key)); break;
        case 'openai':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithOpenAI(messages, onToken, model_name, key)); break;
        case 'mistral':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithMistral(messages, onToken, model_name, key)); break;
        case 'claude':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithClaude(messages, onToken, model_name, key)); break;
        default: throw new Error(`API ${apiName} is not supported`);
    }

    // Finalisation des messages
    newMsg.content = generatedText;
    newMsg.token = completionTokens;
    userMsg.token = currentMessageTokens;
    userMsg.historyTokens = historyTokens;

    // MAJ des tokens et des messages
    try {
        await db.addToken(userId, convId, currentMessageTokens + historyTokens + completionTokens);
        await db.addMessage(userId, convId, userMsg);
        await db.addMessage(userId, convId, newMsg);
    } catch (err) {
        console.error(`Error adding messages for user ${userId} in conversation ${convId}:`, err);
        throw new Error('Failed to add messages');
    }

    return { userMsg, newMsg };
}



/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} messageContent
 * @param {(chunk: string) => void} onToken
 * @param {(userMsg: object, newMsg : object) => void} [onIdGeneratied]
 * @returns {Promise<{userMsg, newMsg}>}
 */
export async function handleMessage(userId, convId, messageContent, onToken, onIdGenerated, model_name = 'llama-3.1-8b-instant') {
    const convData = await db.getConversationById(userId, convId);
    if (!convData) {
        console.error(`Conversation with ID ${convId} not found for user ${userId}`);
        throw new Error('Conversation not found');
    }
    const convName = convData.convName;
    let conv = convData.msgList;
    const userMsg = {
        msgId: uuidv4(),
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString(),
        convName,
        convId,
        token: 0
    };

    const newMsg = {
        msgId: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        convName,
        convId,
        token: 0
    };
    const filteredConv = conv.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    filteredConv.push({
        role: userMsg.role,
        content: userMsg.content
    });
    const maxContextTokens = getMaxTokenInput(model_name);
    const trimmedConv = applySlidingWindow(filteredConv, maxContextTokens);
    return await generateResponseForMessages({
        userId,
        convId,
        messages: trimmedConv,
        userMsg,
        newMsg,
        onToken,
        onIdGenerated,
        model_name
    });
}


/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent 
 */
export async function editMessage(userId, convId, msgId, newContent, onToken, onIdGenerated, model_name = 'llama-3.1-8b-instant') {
    const conv = await db.getConversationById(userId, convId);
    if (!conv) throw new Error('Conversation not found');

    const convName = conv.convName;
    const msg = conv.msgList.find(m => m.msgId === msgId);
    if (!msg) throw new Error('Message not found');

    // Suppression des anciens messages à partir du msg édité
    const index = conv.msgList.indexOf(msg);
    conv.msgList.slice(index).forEach(async m => { await db.deleteMessage(userId, convId, m.msgId) });
    conv.msgList = conv.msgList.slice(0, index);

    const userMsg = {
        msgId,
        role: 'user',
        content: newContent,
        timestamp: new Date().toISOString(),
        convName,
        convId,
        token: 0
    };

    conv.msgList.push(userMsg);

    const filteredConv = conv.msgList.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    const maxContextTokens = getMaxTokenInput(model_name);
    const trimmedConv = applySlidingWindow(filteredConv, maxContextTokens);


    const newMsg = {
        msgId: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        convName,
        convId,
        token: 0
    };

    return await generateResponseForMessages({
        userId,
        convId,
        messages: trimmedConv,
        userMsg,
        newMsg,
        onToken,
        onIdGenerated,
        model_name
    });
}

/**
 * 
 * @param {string} userId 
 * @param {string} messageContent 
 */
export async function createConversation(userId, messageContent, onToken, onIdGenerated, model_name = 'llama-3.1-8b-instant') {

    const apiName = models[model_name]?.api;
    if (!apiName) throw new Error(`Model ${model_name} is not supported`);

    const key = (await getKeyForApi(userId, apiName))?.key;
    if (!key && !apis[apiName].isFree) throw new Error(`API key for ${apiName} is required`);

    const newConv = {
        convId: uuidv4(),
        convName: '',
        date: new Date().toISOString(),
        token: 0,
        msgList: []
    }
    onIdGenerated(newConv);

    const message = [{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '"' }]
    if (model_name.toLowerCase().includes('qwen')) message[0].content += '  IMPORTANT : DON\'T THINK'

    let generatedText, currentMessageTokens, historyTokens, completionTokens;
    switch (apiName) {
        case 'groq':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGroq(message, onToken, model_name, key)); break;
        case 'gemini':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGemini(message, onToken, model_name, key)); break;
        case 'openai':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithOpenAI(message, onToken, model_name, key)); break;
        case 'mistral':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithMistral(message, onToken, model_name, key)); break;
        case 'claude':
            ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithClaude(message, onToken, model_name, key)); break;
        default: throw new Error(`API ${apiName} is not supported`);
    }

    newConv.convName = generatedText;
    newConv.token = currentMessageTokens + historyTokens + completionTokens;
    try {
        await db.addConversation(userId, newConv);
    } catch (err) {
        console.error(`Error creating conversation for user ${userId}:`, err);
        throw new Error('Failed to create conversation');
    }
    return { conv: newConv };
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

export async function getConversationById(userId, convId) {
    const conv = await db.getConversationById(userId, convId);
    if (!conv) {
        throw new Error('Conversation not found');
    }
    return conv;
}
