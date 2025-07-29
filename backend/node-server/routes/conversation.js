import express from 'express';
import * as chatAPI from '../core/chatAPI.js';
import authenticateToken from '../middleware/auth.js';
import { handleStreamError } from './message.js';

const router = express.Router();
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
    const { messageContent, model_name } = req.body;
    const userId = req.user.userId;
    if (!userId || !messageContent || !model_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const onIdGenerated = (conv) => {
            res.write(`\n<<convContainer>>${JSON.stringify({ conv })}\n`);
        };

        const onToken = (chunk) => {
            res.write(chunk);
        };

        const { conv } = await chatAPI.createConversation(userId, messageContent, onToken, onIdGenerated, model_name);
        res.write(`\n<<tokenUsage>>${JSON.stringify({ tokenUsage: conv.token })}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error creating conversation:');
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

router.delete('/:convId', authenticateToken, async (req, res) => {
    const { convId } = req.params;
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


export default router;