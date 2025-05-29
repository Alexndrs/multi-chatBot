const express = require('express');
const router = express.Router();
const auth = require('../core/auth');
const authenticateToken = require('../middleware/auth');

router.post('/', async (req, res) => {
    const { mail, name, password } = req.body;
    if (!mail || !name || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { userId, token } = await auth.createUser(mail, name, password);
        res.status(201).json({ userId, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    if (!mail || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { userId, token } = await auth.loginUser(mail, password);
        res.status(200).json({ userId, token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const userInfo = await auth.getUserInfo(userId);
        if (!userInfo) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(userInfo);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;