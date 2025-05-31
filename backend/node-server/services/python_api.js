const axios = require('axios');

/**
 * 
 * @param {Array<import('../db/interface').messageObject} message 
 * @returns {Promise<string>}
 */
async function chatWithPython(message) {
    console.log('Appel de chatWithPython avec le message:', message);
    // return "[Réponse IA simulée] [input data (history of conv) : " + JSON.stringify(message) + "]";

    const res = await axios.post('http://127.0.0.1:8001/chat', { message });
    return res.data.response;
}

module.exports = { chatWithPython };




async function test() {
    try {
        const res = await chatWithPython([
            { role: 'user', content: 'give me the recipe for cookies please, answer in a structured message for cooking' }
        ]);
        console.log('Réponse du chatbot:', res);
    } catch (err) {
        console.error('Erreur:', err.message);
    }
}

// Appel du test
test();