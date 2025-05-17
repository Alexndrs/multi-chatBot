const axios = require('axios');

/**
 * 
 * @param {Array<import('../db/interface').messageObject} message 
 * @returns {Promise<string>}
 */
async function chatWithPython(message) {
    return "[Réponse IA simulée]";

    const res = await axios.post('http://127.0.0.1:8000/chat', { message });
    return res.data.response;
}

module.exports = { chatWithPython };




// async function test() {
//     try {
//         const res = await chatWithPython([
//             { role: 'user', content: 'Hello, how are you?' }
//         ]);
//         console.log('Réponse du chatbot:', res);
//     } catch (err) {
//         console.error('Erreur:', err.message);
//     }
// }

// Appel du test
// test();