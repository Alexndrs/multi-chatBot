const { chatWithPython } = require('../services/python_local');

async function handleMessage(userId, message) {
    // (Optionnel) : récupérer l'historique utilisateur dans MongoDB ici
    const reply = await chatWithPython(message);
    // (Optionnel) : enregistrer la conversation dans la DB ici
    return reply;
}

module.exports = { handleMessage };
