const express = require('express');
const router = express.Router();
const chatAPI = require('../core/chatAPI');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
    const { convId, messageContent } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !messageContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { userMsg, newMsg } = await chatAPI.handleMessage(userId, convId, messageContent);
        res.status(200).json({ userMsg, newMsg });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/', authenticateToken, async (req, res) => {
    const { convId, msgId, newContent } = req.body;
    const userId = req.user.userId;
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
