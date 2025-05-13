const express = require('express');
const router = express.Router();
const chatAPI = require('../core/chatAPI');

router.post('/', async (req, res) => {
    const { userId, message } = req.body;
    const response = await chatAPI.handleMessage(userId, message);
    res.json({ response });
});

module.exports = router;
