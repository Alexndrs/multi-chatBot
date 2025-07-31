import * as db from '../db/sqlite_interface.js';
import { getKeys } from './keys.js';
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
 * @param {string} pass 
 * @param {string} code
 * @returns {Promise<{userId: string, token: string}>}
 */
export async function createUser(mail, name, pass, code) {
    // Verify if user already exists
    const existingUser = await db.getUserByMail(mail);
    if (existingUser) {
        throw new Error('Email already exists');
    }
    const hashPass = await bcrypt.hash(pass, saltRounds);
    const userId = uuidv4();
    await db.addUser(
        userId,
        name,
        mail,
        hashPass,
        code
    );
    const token = jwt.sign({ userId: userId, email: mail }, JWT_SECRET, { expiresIn: '2h' });
    return { userId, token };
}

/**
 * 
 * @param {string} mail 
 * @param {string} pass 
 * @returns {Promise<{userId: string, token: string}>}
 */
export async function loginUser(mail, pass) {
    // Verify if user exists
    const user = await db.getUserByMail(mail);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify password
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
        throw new Error('Invalid password');
    }
    // Générer le token
    const token = jwt.sign({ userId: user.userId, email: mail }, JWT_SECRET, { expiresIn: '2h' });

    return { userId: user.userId, token };
}

/**
 * 
 * @param {string} userId 
 * @returns {Promise<{name: string, email: string, preferences}>}
 */
export async function getUserInfo(userId) {
    const userInfo = await db.getUserInfo(userId);
    if (!userInfo) {
        throw new Error('User not found');
    }
    return userInfo;
}

/**
 * 
 * @param {string} userId 
 * @returns {Promise<{userApis: string[], availableApis: Object, availableModels: Object}>}
 */
export async function getUserApis(userId) {
    const userKeys = await getKeys(userId);
    const userApis = userKeys.map(k => k.api);
    return {
        userApis,
        availableApis: apis,
        availableModels: models,
    }
}
/**
 * 
 * @param {string} userId 
 * @param {string} enteredCode 
 * @returns {Promise<boolean>}
 */
export async function verifyUserCode(userId, enteredCode) {
    const realCode = await db.getUserVerificationCode(userId);
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
