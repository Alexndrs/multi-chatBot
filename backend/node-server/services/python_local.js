const axios = require('axios');

async function chatWithPython(message) {
    const res = await axios.post('http://localhost:5000/chat', { message });
    return res.data.response;
}

module.exports = { chatWithPython };
