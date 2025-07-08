import crypto from "crypto";
import 'dotenv/config';
const mySecret = process.env.ENCRYPT_SECRET;

import { getUserKeys, getUserKeysForApi, addUserKey } from "../db/sqlite_interface.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

// export const generateSecretKey = () => crypto.randomBytes(32).toString('hex');
// secret placed in .env

export function encrypt(text, secretKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return iv.toString('hex') + ':' + encrypted + ':' + authTag;
}

export function decrypt(encryptedData, secretKey) {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

export async function addKey(key, api_name, userId) {
    console.log("Adding the key : ", key, "for api:", api_name);

    const encryptedKey = encrypt(key, mySecret);
    await addUserKey(userId, encryptedKey, api_name);
}

export async function getKeys(userId) {
    const keys = await getUserKeys(userId);
    return keys.map(key => ({
        ...key,
        key: decrypt(key.key, mySecret)
    }));
}

export async function getKeyForApi(userId, api_name) {
    const key = await getUserKeysForApi(userId, api_name);
    if (!key) return undefined;
    return {
        ...key,
        key: decrypt(key.key, mySecret)
    };
}