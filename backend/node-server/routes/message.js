import express from 'express';
import * as chatAPI from '../core/chatAPI.js';
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
router.post('/', authenticateToken, async (req, res) => {
    const { convId, messageContent, model_name } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !messageContent || !model_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // onToken envoie chaque token
        const onToken = (chunk) => {
            res.write(chunk); // stream vers le client
        };

        const onIdGenerated = (userMsg, newMsg) => {
            res.write(`\n<<MsgCONTAINER>>${JSON.stringify({ userMsg, newMsg })}\n`);
        };


        const { userMsg, newMsg } = await chatAPI.handleMessage(userId, convId, messageContent, onToken, onIdGenerated, model_name);
        res.write(`\n<<tokenUsage>>${JSON.stringify({ currentMessageTokens: userMsg.token, historyTokens: userMsg.historyTokens, responseToken: newMsg.token, responseToken: newMsg.token })}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error sending/streaming message:');
    }
});


router.put('/', authenticateToken, async (req, res) => {
    const { convId, msgId, newContent, model_name } = req.body;
    const userId = req.user.userId;
    if (!userId || !convId || !msgId || !newContent || !model_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const onToken = (chunk) => {
            res.write(chunk);
        };

        const onIdGenerated = (userMsg, newMsg) => {
            res.write(`\n<<MsgCONTAINER>>${JSON.stringify({ userMsg, newMsg })}\n`);
        };

        const { userMsg, newMsg } = await chatAPI.editMessage(userId, convId, msgId, newContent, onToken, onIdGenerated, model_name);
        res.write(`\n<<tokenUsage>>${JSON.stringify({ currentMessageTokens: userMsg.token, historyTokens: userMsg.historyTokens, responseToken: newMsg.token })}\n`);
        res.end();
    } catch (error) {
        handleStreamError(res, error, 'Error editing/streaming message:');
    }
});



export default router;
