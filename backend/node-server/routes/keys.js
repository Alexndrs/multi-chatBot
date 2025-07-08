import express from 'express';
import * as encryption from '../core/encryption.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { api, key } = req.body;
    if (!userId || !api || !key) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await encryption.addKey(key, api, userId);
        res.status(200).json({ message: 'api key added successfully' })
    } catch (error) {
        console.error('Error adding key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const keys = await encryption.getKeys(userId);
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
        await encryption.deleteKey(userId, api_name);
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
        const key = await encryption.getKeyForApi(userId, api_name);
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