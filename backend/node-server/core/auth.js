import * as db from '../db/sqlite_interface.js';
import { getKeys } from './encryption.js';
import { apis, models } from '../services/utils.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET

/**
 * 
 * @param {string} mail 
 * @param {string} name 
 * @param {string} hpass 
 * @returns {Promise<{import('../db/interface').userObject}>}
 */
export async function createUser(mail, name, pass, code) {
    // Verify if user already exists
    const existingUser = await db.getUserByMail(mail);
    if (existingUser) {
        throw new Error('Email already exists');
    }
    const hashPass = await bcrypt.hash(pass, saltRounds);
    const userId = uuidv4();
    await db.addUser(userId, name, mail, hashPass, code);

    const token = jwt.sign({ userId: userId, email: mail }, JWT_SECRET, { expiresIn: '6h' });
    return { userId, token };
}

/**
 * 
 * @param {string} mail 
 * @param {string} pass 
 * @returns 
 */
export async function loginUser(mail, pass) {
    // Verify if user exists
    const user = await db.getUserByMail(mail);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify password
    const match = await bcrypt.compare(pass, user.userInfo.password);
    if (!match) {
        throw new Error('Invalid password');
    }
    // Générer le token
    const token = jwt.sign({ userId: user.userId, email: mail }, JWT_SECRET, { expiresIn: '2h' });

    return { userId: user.userId, token };
}

export async function getUserInfo(userId) {
    const userInfo = await db.getUserInfo(userId);
    if (!userInfo) {
        throw new Error('User not found');
    }
    return userInfo;
}

export async function getUserApis(userId) {
    const userKeys = await getKeys(userId);
    const userApis = userKeys.map(k => k.api);
    return {
        userApis,
        availableApis: apis,
        availableModels: models,
    }
}

export async function verifyUserCode(userId, enteredCode) {
    const realCode = await db.getUserVerificationCode(userId);
    console.log('realCode:', realCode, 'enteredCode:', enteredCode);
    if (!realCode) {
        throw new Error('Verification code not found');
    }

    if (realCode !== enteredCode) {
        throw new Error('Invalid verification code');
    }

    // Update user verification status
    await db.setUserVerified(userId);
    return true;
}
