import { chatWithPython } from '../services/python_api.js';
import { chatWithGemini, chatWithGroq } from '../services/free_api.js';
import { applySlidingWindow, getMaxTokenInput } from '../services/utils.js';
import * as db from '../db/sqlite_interface.js';
import { v4 as uuidv4 } from 'uuid';

export async function getAllConvIdsAndNameAndDate(userId) {
    const convIdsAndName = await db.getUserConversationsIdAndNameAndDate(userId);
    if (!convIdsAndName) {
        throw new Error('No conversations found');
    }
    return convIdsAndName;
}

async function generateResponseForMessages({
    userId,
    convId,
    convName,
    messages,
    userMsg,
    newMsg,
    onToken,
    onIdGenerated,
    model_name
}) {
    if (onIdGenerated) onIdGenerated(userMsg, newMsg);

    // Appel au bon modèle
    let generatedText, currentMessageTokens, historyTokens, completionTokens;
    if (['llama-3.1-8b-instant', 'qwen-qwq-32b', 'gemma2-9b-it'].includes(model_name)) {
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } =
            await chatWithGroq(messages, onToken, model_name));
    } else if (['gemini-2.5-flash', 'gemini-2.5-pro'].includes(model_name)) {
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } =
            await chatWithGemini(messages, onToken, model_name));
    } else {
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } =
            await chatWithPython(messages, onToken));
    }

    // Finalisation des messages
    newMsg.content = generatedText;
    newMsg.token = completionTokens;
    userMsg.token = currentMessageTokens;
    userMsg.historyTokens = historyTokens;

    // MAJ des tokens et des messages
    await db.addToken(userId, convId, currentMessageTokens + historyTokens + completionTokens);
    await db.addMessage(userId, convId, userMsg);
    await db.addMessage(userId, convId, newMsg);

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
    const maxContextTokens = getMaxTokenInput(model_name);
    const trimmedConv = applySlidingWindow(filteredConv, maxContextTokens);
    return await generateResponseForMessages({
        userId,
        convId,
        convName,
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
    conv.msgList.slice(index).forEach(async m => await db.deleteMessage(userId, convId, m.msgId));
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
        convName,
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

    const newConv = {
        convId: uuidv4(),
        convName: '',
        date: new Date().toISOString(),
        token: 0,
        msgList: []
    }
    onIdGenerated(newConv);

    let generatedText, currentMessageTokens, historyTokens, completionTokens;
    if (['llama-3.1-8b-instant', 'qwen-qwq-32b', 'gemma2-9b-it'].includes(model_name)) {
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGroq([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '"' }], onToken, model_name));
    } else if (['gemini-2.5-flash', 'gemini-2.5-pro'].includes(model_name)) {
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithGemini([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '"' }], onToken, model_name));
    }
    else {
        // By default use the python API when the model is not supported by Groq
        ({ generatedText, currentMessageTokens, historyTokens, completionTokens } = await chatWithPython([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '" \no_think' }], onToken));
    }

    newConv.convName = generatedText;
    newConv.token = currentMessageTokens + historyTokens + completionTokens;
    await db.addConversation(userId, newConv);
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
