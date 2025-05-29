const db = require('../db/interface');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET

/**
 * 
 * @param {string} mail 
 * @param {string} name 
 * @param {string} hpass 
 * @returns {import('../db/interface').userObject}
 */
async function createUser(mail, name, pass) {
    // Verify if user already exists
    if (db.getUserByMail(mail)) {
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


    db.addUser(newUser);
    const token = jwt.sign({ userId: newUser.userId, email: mail }, JWT_SECRET, { expiresIn: '2h' });
    return { userId: newUser.userId, token };
}

/**
 * 
 * @param {string} mail 
 * @param {string} pass 
 * @returns 
 */
async function loginUser(mail, pass) {
    // Verify if user exists
    const user = db.getUserByMail(mail);
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

async function getUserInfo(userId) {
    const userInfo = db.getUserInfo(userId);
    if (!userInfo) {
        throw new Error('User not found');
    }
    return userInfo;
}


module.exports = {
    createUser,
    loginUser,
    getUserInfo,
    JWT_SECRET
};