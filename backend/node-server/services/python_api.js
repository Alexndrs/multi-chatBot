/**
 * 
 * @param {Array<import('../db/interface').messageObject} message 
 * @returns {Promise<string>}
 */
export async function chatWithPython(message, onToken) {
    console.log('Appel de chatWithPython avec le message:', message);
    // return "[Réponse IA simulée] [input data (history of conv) : " + JSON.stringify(message) + "]";

    const response = await fetch('http://127.0.0.1:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let generatedText = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        generatedText += chunk;
        if (onToken) onToken(chunk);
    }
    return { generatedText, promptTokens: 0, completionTokens: 0 }
}




// async function test() {
//     try {
//         process.stdout.write('Réponse du chatbot: ');

//         messages = [
//             {
//                 role: 'user',
//                 content: 'Hey comment tu t appelles ?',
//             },
//             {
//                 role: 'assistant',
//                 content: 'Je suis Qwen-0.6B un modèle de langage développé par Alibaba. Je suis ici pour vous aider avec vos questions et vos tâches.',
//             },
//             {
//                 msgId: 'dbfefaa3-61c2-4d1a-890c-009e212774a8',
//                 role: 'user',
//                 content: 'J aimerais savoir si ta mémoire est activée. Peux tu me rappeler ce que je t ai demandé précédemment',
//                 timestamp: '2025-05-31T20:06:32.743Z'
//             }
//         ]

//         message = [{ role: 'user', content: 'give me the recipe for cookies please, answer in a structured message for cooking' }]


//         await chatWithPython(
//             messages,
//             (chunk) => process.stdout.write(chunk)
//         );
//         process.stdout.write('\n');
//     } catch (err) {
//         console.error('Erreur:', err.message);
//     }
// }

// // Appel du test
// test();



// [
//     { 'role': 'user', 'content': 'Hey comment tu t appelles ?' },
//     { 'role': 'assistant', 'content': 'Je suis Qwen-0.6B un modèle de langage développé par Alibaba. Je suis ici pour vous aider avec vos questions et vos tâches.' },
//     { 'role': 'user', 'content': 'J aimerais savoir si ta mémoire est activée. Peux tu me rappeler ce que je t ai demandé précédemment' }
// ]