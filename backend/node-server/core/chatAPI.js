const { chatWithPython } = require('../services/python_api');
const { chatWithGroq } = require('../services/groq_api');
const { chatWithGemini } = require('../services/gemini_api');
const db = require('../db/interface');
const uuidv4 = require('uuid').v4;

async function getAllConvIdsAndNameAndDate(userId) {
    const convIdsAndName = db.getUserConversationsIdAndNameAndDate(userId);
    if (!convIdsAndName) {
        throw new Error('No conversations found');
    }
    return convIdsAndName;
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
async function handleMessage(userId, convId, messageContent, onToken, onIdGenerated, model_name = 'llama-3.1-8b-instant') {
    // Ajouter le message à la conversation
    console.log('send msg with model :', model_name);

    const convName = db.getConversationById(userId, convId).convName;

    const userMsg = {
        msgId: uuidv4(),
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString(),
        convName: convName,
        convId: convId,
        token: 0
    }

    const newMsg = {
        msgId: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        convName: convName,
        convId: convId,
        token: 0
    }
    if (onIdGenerated) onIdGenerated(userMsg, newMsg);
    // Récupérer l'historique de la conversation
    const conv = db.getAllMessages(userId, convId);

    // Filter the id from the messages in the conv
    const filteredConv = conv.map(msg => {
        return {
            role: msg.role,
            content: msg.content,
        }
    })
    // Append the new user message to the conversation
    filteredConv.push({
        role: userMsg.role,
        content: userMsg.content,
    });


    // TODO: Envoyer l'historique à l'API de l'IA (python ou groq)
    let generatedText, promptTokens, completionTokens;

    if (['llama-3.1-8b-instant', 'qwen-qwq-32b', 'gemma2-9b-it'].includes(model_name)) {
        console.log('Using Groq API for model:', model_name);
        ({ generatedText, promptTokens, completionTokens } = await chatWithGroq(filteredConv, onToken, model_name));
    } else if (['gemini-2.5-flash', 'gemini-2.5-pro'].includes(model_name)) {
        console.log('Using Gemini API for model:', model_name);
        ({ generatedText, promptTokens, completionTokens } = await chatWithGemini(filteredConv, onToken, model_name));
    } else {
        ({ generatedText, promptTokens, completionTokens } = await chatWithPython(filteredConv, onToken));
    }


    console.log('Generated text:', generatedText);
    newMsg.content = generatedText;
    newMsg.token = completionTokens;
    console.log('newMsg:', newMsg);
    userMsg.token = promptTokens;
    // Ajouter la réponse de l'IA à la conversation et update le nombre de tokens
    db.addToken(userId, convId, promptTokens + completionTokens);

    console.log("Adding to db : ", userMsg, newMsg);
    db.addMessage(userId, convId, userMsg)
    db.addMessage(userId, convId, newMsg)
    return { userMsg, newMsg };
}

/**
 * 
 * @param {string} userId 
 * @param {string} messageContent 
 */
async function createConversation(userId, messageContent, onToken, onIdGenerated, model_name = 'llama-3.1-8b-instant') {

    const newConv = {
        convId: uuidv4(),
        convName: '',
        date: new Date().toISOString(),
        token: 0,
        msgList: []
    }
    onIdGenerated(newConv);

    let generatedText, promptTokens, completionTokens;
    if (['llama-3.1-8b-instant', 'qwen-qwq-32b', 'gemma2-9b-it'].includes(model_name)) {
        console.log('Using Groq API for model:', model_name);
        ({ generatedText, promptTokens, completionTokens } = await chatWithGroq([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '"' }], onToken, model_name));
    } else if (['gemini-2.5-flash', 'gemini-2.5-pro'].includes(model_name)) {
        console.log('Using Gemini API for model:', model_name);
        ({ generatedText, promptTokens, completionTokens } = await chatWithGemini([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContentv + '"' }], onToken, model_name));
    }
    else {
        // By default use the python API when the model is not supported by Groq
        ({ generatedText, promptTokens, completionTokens } = await chatWithPython([{ role: 'user', content: 'From the following message, create a short title in the same language as the input for this conversation, answer with only the title no ponctuation or container just the content of the title. The message : "' + messageContent + '" \no_think' }], onToken));
    }

    newConv.convName = generatedText;
    newConv.token = promptTokens + completionTokens;
    db.addConversation(userId, newConv);
    return { conv: newConv };
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} newName 
 */
function changeConversationName(userId, convId, newName) {
    db.changeConversationName(userId, convId, newName)
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 */
function deleteConversation(userId, convId) {
    try {
        db.deleteConversation(userId, convId);
    }
    catch (err) {
        throw new Error('Conversation not found');
    }
}

function getConversationById(userId, convId) {
    const conv = db.getConversationById(userId, convId);
    if (!conv) {
        throw new Error('Conversation not found');
    }
    return conv;
}

/**
 * 
 * @param {string} userId 
 * @param {string} convId 
 * @param {string} msgId 
 * @param {string} newContent 
 */
async function editMessage(userId, convId, msgId, newContent) {
    try {
        // We need to delete all messages after the message to edit
        const conv = db.getConversationById(userId, convId);
        if (!conv) {
            throw new Error('Conversation not found');
        }
        const msg = conv.msgList.find(m => m.msgId === msgId);

        if (!msg) {
            throw new Error('Message not found');
        }
        const index = conv.msgList.indexOf(msg);
        conv.msgList.slice(index, conv.msgList.length).forEach(m => {
            db.deleteMessage(userId, convId, m.msgId);
        })

        const { userMsg, newMessage } = await handleMessage(userId, convId, newContent);
        return { userMessage: userMsg, newMessage: newMessage };
    }
    catch (err) {
        throw new Error('Message not found');
    }
}


module.exports = {
    handleMessage,
    getConversationById,
    getAllConvIdsAndNameAndDate,
    createConversation,
    changeConversationName,
    deleteConversation,
    editMessage
};
