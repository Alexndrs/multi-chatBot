/// <reference path="./types.js" />
import 'dotenv/config';
const mySecret = process.env.ENCRYPT_SECRET;
import { getUserKeys, getUserKeysForApi, addUserKey, deleteKey } from "../db/sqlite_interface.js";
import { testGroq, testClaude, testGemini, testMistral, testOpenAI } from "../services/api_providers";
import { encrypt, decrypt } from "./encryption.js";

/**
 * Test an API key for a specific API and return a message indicating success or failure : usefull for testing if a key is valid before saving it
 * 
 * @param {string} key 
 * @param {string} apiName 
 * @returns {Promise<{message: string, error: boolean}>}
 */
export async function testKey(key, apiName) {
    let answer;
    switch (apiName) {
        case 'groq':
            answer = await testGroq(key); break;
        case 'gemini':
            answer = await testGemini(key); break;
        case 'openai':
            answer = await testOpenAI(key); break;
        case 'mistral':
            answer = await testMistral(key); break;
        case 'claude':
            answer = await testClaude(key); break;
        default: answer = { message: `API ${apiName} is not supported`, error: true };
    }
    return answer;
}


/**
 * Add a key encrypted in the database
 * @param {string} key 
 * @param {string} api_name 
 * @param {string} userId 
 * @returns {Promise<void>}
 */
export async function addKey(key, api_name, userId) {
    const encryptedKey = encrypt(key, mySecret);
    await addUserKey(userId, encryptedKey, api_name);
}

/**
 * 
 * @param {string} userId 
 * @param {string} api_name 
 * @return {Promise<void>}
 */
export async function deleteKeyForApi(userId, api_name) {
    await deleteKey(userId, api_name);
}

/**
 * Return the decrypted keys for a user
 * @param {string} userId 
 * @returns {Promise<{keyId:string, key:string, api:string, date:string}[]>}
 */
export async function getKeys(userId) {
    const keys = await getUserKeys(userId);
    return keys.map(key => ({
        ...key,
        key: decrypt(key.key, mySecret)
    }));
}

/**
 * Return the decrypted key for a specific API for a user
 * @param {string} userId 
 * @param {string} api_name 
 * @returns {Promise<{keyId:string, key:string, api:string, date:string}>}
 */
export async function getKeyForApi(userId, api_name) {
    const key = await getUserKeysForApi(userId, api_name);
    if (!key) return undefined;
    return {
        ...key,
        key: decrypt(key.key, mySecret)
    };
}