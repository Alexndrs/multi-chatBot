const express = require('express');
const router = express.Router();
const chatAPI = require('../core/chatAPI');

router.post('/', async (req, res) => {
    const { userId, convId, messageContent } = req.body;
    if (!userId || !convId || !messageContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await chatAPI.handleMessage(userId, convId, messageContent);
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/', async (req, res) => {
    const { userId, convId, msgId, newContent } = req.body;
    if (!userId || !convId || !msgId || !newContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const response = await chatAPI.editMessage(userId, convId, msgId, newContent);
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
