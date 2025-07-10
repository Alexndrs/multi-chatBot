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
export async function createUser(mail, name, pass) {
    // Verify if user already exists
    const existingUser = await db.getUserByMail(mail); // <-- important
    if (existingUser) {
        throw new Error('Email already exists');
    }


    // Create a new user
    const newUser = {
        userId: uuidv4(),
        userInfo: {
            name: name,
            email: mail,
            password: await bcrypt.hash(pass, saltRounds),
            preferences: {}
        },
        conversations: []
    };


    await db.addUser(newUser);
    const token = jwt.sign({ userId: newUser.userId, email: mail }, JWT_SECRET, { expiresIn: '2h' });
    return { userId: newUser.userId, token };
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