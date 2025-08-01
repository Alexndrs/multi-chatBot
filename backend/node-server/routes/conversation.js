import express from 'express';
import * as chatAPI from '../core/chatAPI_v2.js';
import * as conv from '../core/conversation.js';
import authenticateToken from '../middleware/auth.js';
import { handleStreamError } from './message.js';

const router = express.Router();
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {

        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const convMetadatas = await conv.getConvList(userId);
        res.status(200).json({ convMetadatas });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { messageContent, modelNames } = req.body;
    const userId = req.user.userId;
    if (!userId || !messageContent || !modelNames) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');


        const { convId, convName } = await conv.createConversation(userId, messageContent, modelNames[0]);

        res.write(`\n<<convContainer>>${JSON.stringify({ convId, convName })}\n`);

        const firstMessage = await chatAPI.addUserMessage(userId, convId, [], messageContent);

        res.write(`\n<<messageContainer>>${JSON.stringify(firstMessage)}\n`);


        const history = await chatAPI.generateLinearHistoryForOneMessage(convId, firstMessage.msgId);

        const replies = await chatAPI.generateReply(
            userId,
            convId,
            history,
            modelNames,
            (token, model) => {
                res.write(`\n<<tk>>${JSON.stringify({ model, token })}\n`);
            },
            (replyContainer) => {
                res.write(`\n<<replyContainer>>${JSON.stringify(replyContainer)}\n`);
            }
        );

        res.write(`\n<<finalReplies>>${JSON.stringify({ replies })}\n`);
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
        const graph = await conv.getConversationById(userId, convId);
        res.status(200).json({ graph });
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
        await conv.deleteConversation(userId, convId);
        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:convId', authenticateToken, async (req, res) => {
    const { convId } = req.params;
    const { newName } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !newName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await conv.changeConversationName(userId, convId, newName);
        res.status(200).json({ message: 'Conversation name changed successfully' });
    } catch (error) {
        console.error('Error changing conversation name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;