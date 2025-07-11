import express from 'express';
import * as auth from '../core/auth.js';
import authenticateToken from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { sendVerificationCodeEmail } from '../services/mail_sender.js';
import crypto from 'crypto';



const router = express.Router();
router.post('/', async (req, res) => {
    const { mail, name, password } = req.body;
    if (!mail || !name || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { userId } = await auth.createUser(mail, name, password);

        // 🔢 Générer un code à 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await auth.saveVerificationCode(userId, code); // stocker code + expiration (15min)

        await sendVerificationCodeEmail({
            to: mail,
            name,
            code
        });

        res.status(201).json({
            success: true,
            message: 'User created. Verification code sent by email.'
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/verify-email', async (req, res) => {
    const { mail, code } = req.body;
    if (!mail || !code) {
        return res.status(400).json({ error: 'Missing mail or code' });
    }

    try {
        const user = await auth.getUserByEmail(mail);
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

        if (user.verificationCode !== code || Date.now() > user.codeExpiresAt) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        await auth.markUserAsVerified(user.id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ error: 'Internal error' });
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
        const apiInfo = await auth.getUserApis(userId);
        res.status(200).json({ userInfo, apiInfo });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;