const express = require('express');
const router = express.Router();
const auth = require('../core/auth');

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

module.exports = router;