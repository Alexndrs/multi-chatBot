const express = require('express');
const router = express.Router();
const chatAPI = require('../core/chatAPI');
const authenticateToken = require('../middleware/auth');


router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {

        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const conversationsIdsAndNameAndDate = await chatAPI.getAllConvIdsAndNameAndDate(userId);
        res.status(200).json({ conversationsIdsAndNameAndDate });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { messageContent } = req.body;
    const userId = req.user.userId;
    if (!userId || !messageContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const onIdGenerated = (conv) => {
            res.write(`<<convContainer>>${JSON.stringify({ conv })}\n`);
        };

        const onToken = (chunk) => {
            res.write(chunk); // stream vers le client
        };

        await chatAPI.createConversation(userId, messageContent, onToken, onIdGenerated);
        res.end();
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get(`/:convId`, authenticateToken, async (req, res) => {
    const { convId } = req.params;
    const userId = req.user.userId;
    if (!userId || !convId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await chatAPI.getConversationById(userId, convId);
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/', authenticateToken, async (req, res) => {
    const { convId } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await chatAPI.deleteConversation(userId, convId);
        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/', authenticateToken, async (req, res) => {
    const { convId, newName } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !newName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await chatAPI.changeConversationName(userId, convId, newName);
        res.status(200).json({ message: 'Conversation name changed successfully' });
    } catch (error) {
        console.error('Error changing conversation name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
