import express from 'express';
import * as auth from '../core/auth.js';
import authenticateToken from '../middleware/auth.js';
import { isVerified, getUserById, getUserVerificationCode } from '../db/sqlite_interface.js';
import { sendVerificationEmail } from '../services/mail_sender.js';

const router = express.Router();
router.post('/', async (req, res) => {
    const { mail, name, password } = req.body;
    if (!mail || !name || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const { userId, token } = await auth.createUser(mail, name, password, code);
        await sendVerificationEmail({ to: mail, name, code });
        res.status(201).json({ userId, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.post('/resend', authenticateToken, async (req, res) => {
    // This route is for resending the verification email
    const userId = req.user.userId;
    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }
    try {
        const user = await getUserById(userId);
        console.log('Resending verification email for user:', user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.userInfo.verified) {
            return res.status(400).json({ error: 'User already verified' });
        }
        const code = await getUserVerificationCode(userId);
        if (!code) {
            return res.status(404).json({ error: 'Verification code not found' });
        }
        await sendVerificationEmail({ to: user.userInfo.email, name: user.userInfo.name, code });
        res.status(200).json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.post('/verify/:code', authenticateToken, async (req, res) => {
    const { code } = req.params;
    const userId = req.user.userId;
    if (!userId || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const verificationResult = await auth.verifyUserCode(userId, code);
        if (verificationResult) {
            return res.status(200).json({ message: 'User verified successfully' });
        }
        const status = result.error === 'Verification code not found' ? 404 : 400;
        return res.status(status).json({ error: result.error });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
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
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        try {
            const isUserVerified = await isVerified(userId);
            if (!isUserVerified) {
                return res.status(403).json({ error: 'User not verified' });
            }
            const userInfo = await auth.getUserInfo(userId);
            if (!userInfo) {
                return res.status(404).json({ error: 'User not found' });
            }
            const apiInfo = await auth.getUserApis(userId);
            res.status(200).json({ userInfo, apiInfo, verified: isUserVerified });
        } catch {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;