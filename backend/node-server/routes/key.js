import express from 'express';
import authenticateToken from '../middleware/auth.js';
import * as k from '../core/key.js';

const router = express.Router();
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { api, key } = req.body;
    if (!userId || !api || !key) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Test the API key before adding it
        const testResult = await k.testKey(key, api);
        if (testResult.error) {
            return res.status(400).json({ message: `Invalid API key for ${api}: ${testResult.message}`, error: true });
        }
        await k.addKey(key, api, userId);
        res.status(200).json(testResult);
    } catch (error) {
        console.error('Error adding key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const keys = await k.getKeys(userId);
        res.status(200).json(keys);
    } catch (error) {
        console.error('Error fetching keys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:api_name', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const api_name = req.params.api_name;
    if (!userId || !api_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await k.deleteKeyForApi(userId, api_name);
        res.status(200).json({ message: 'API key deleted successfully' });
    } catch (error) {
        console.error('Error deleting key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:api_name', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const api_name = req.params.api_name;
    if (!userId || !api_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const key = await k.getKeyForApi(userId, api_name);
        if (!key) {
            return res.status(404).json({ error: 'API key not found' });
        }
        res.status(200).json(key);
    } catch (error) {
        console.error('Error fetching key for API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;