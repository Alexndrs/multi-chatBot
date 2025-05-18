const express = require('express');
const router = express.Router();
const chatAPI = require('../core/chatAPI');

router.post('/', async (req, res) => {
    const { userId, messageContent } = req.body;
    if (!userId || !messageContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const convId = await chatAPI.createConversation(userId, messageContent);
        res.status(200).json({ convId });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    const { userId, convId } = req.body;
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

router.delete('/', async (req, res) => {
    const { userId, convId } = req.body;
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

router.put('/', async (req, res) => {
    const { userId, convId, newName } = req.body;
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
