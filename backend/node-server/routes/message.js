import express from 'express';
import * as chatAPI from '../core/chatAPI_v2.js';
import authenticateToken from '../middleware/auth.js';

export function handleStreamError(res, error, logPrefix = '') {
    console.error(`${logPrefix} ${error.message}`, error);
    try {
        res.write(`\n<<error>>${JSON.stringify({ message: error.message || 'Internal server error' })}\n`);
        res.end();
    } catch {
        res.destroy();
    }
}


const router = express.Router();
router.post('/reply', authenticateToken, async (req, res) => {
    const { convId, messageContent, modelNames, parentId } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !messageContent || !modelNames) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const userMessage = await chatAPI.addUserMessage(userId, convId, parentId, messageContent);

        res.write(`\n<<messageContainer>>${JSON.stringify(userMessage)}\n`);

        const history = await chatAPI.generateLinearHistoryForOneMessage(convId, userMessage.msgId);

        const replies = await chatAPI.generateReply(
            userId,
            convId,
            history,
            modelNames,
            (token, model) => {
                res.write(`\n<<tk>>${JSON.stringify({ model, token })}\n`);
            },
            (replyContainer) => {
                // When client receives this, it should create a new containers for the multiple received replies
                res.write(`\n<<replyContainer>>${JSON.stringify(replyContainer)}\n`);
            }
        );

        res.write(`\n<<finalReplies>>${JSON.stringify({ replies })}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error sending/streaming message:');
    }
});

router.post('/merge', authenticateToken, async (req, res) => {
    const { convId, modelName, parentId } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !modelName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const parents = await Promise.all(parentId.map(msgId => db.getMessageById(userId, convId, msgId)));

        const linearHistoryForMerge = await chatAPI.generateLinearHistoryForMultipleMessages(convId, parents);

        const replies = await chatAPI.generateReply(
            userId,
            convId,
            linearHistoryForMerge,
            [modelName],
            (token, model) => {
                res.write(`\n<<tk>>${JSON.stringify({ model, token })}\n`);
            },
            (replyContainer) => {
                // When client receives this, it should create a new container for the merged reply Message
                res.write(`\n<<mergeContainer>>${JSON.stringify(replyContainer[modelName])}\n`);
            }
        );

        res.write(`\n<<finalMerge>>${JSON.stringify(replies[modelName])}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error sending/streaming message:');
    }
});




router.put('/edit', authenticateToken, async (req, res) => {
    const { convId, msgId, newContent, modelNames } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !msgId || !newContent || !modelNames) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const replies = await chatAPI.editUserMessage(
            userId,
            convId,
            msgId,
            newContent,
            modelNames,
            (token, model) => {
                res.write(`\n<<tk>>${JSON.stringify({ model, token })}\n`);
            },
            (replyContainer) => {
                // When client receives this, it should replace the old user message with the new one and creating the new reply container
                res.write(`\n<<replyContainer>>${JSON.stringify(replyContainer)}\n`);
            }
        );

        res.write(`\n<<finalReplies>>${JSON.stringify({ replies })}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error editing/streaming message:');
    }
});

router.put('/regenerate', authenticateToken, async (req, res) => {
    const { convId, msgId, modelName } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !msgId || !newContent || !modelName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const reply = await chatAPI.regenerateReply(
            userId,
            convId,
            msgId,
            modelName,
            (token, model) => {
                res.write(`\n<<tk>>${JSON.stringify({ model, token })}\n`);
            },
            (replyContainer) => {
                // When client receives this, it should replace the old assistant message with the new one
                res.write(`\n<<replyContainer>>${JSON.stringify(replyContainer)}\n`);
            }
        );

        res.write(`\n<<finalReply>>${JSON.stringify(reply)}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error editing/streaming message:');
    }
});



export default router;
