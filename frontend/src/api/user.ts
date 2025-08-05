import type { Apis, Models } from '../contexts/userContext';
import { serverUrl } from './config';


export const getToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
    } catch {
        localStorage.removeItem('token');
        return null;
    }

    return token;
}



export const removeToken = () => {
    localStorage.removeItem('token');
}



export const createUser = async (name: string, mail: string, password: string): Promise<void> => {
    const response = await fetch(`${serverUrl}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
    }
    const json = await response.json();
    localStorage.setItem('token', json.token);
}


export const verifyCode = async (code: string): Promise<void> => {
    const response = await fetch(`${serverUrl}/user/verify/${code}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify code');
    }
}


export const resendVerificationEmail = async (): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${serverUrl}/user/resend`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend verification email');
    }
}


export const loginUser = async (mail: string, password: string): Promise<void> => {
    const response = await fetch(`${serverUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
    }
    const json = await response.json();
    localStorage.setItem('token', json.token);
}

export const logoutUser = (): void => {
    removeToken();
    window.location.reload();
}


interface allInfo {
    userInfo: { name: string, mail: string, preferences: unknown };
    apiInfo: { userApis: string[], availableApis: Apis, availableModels: Models };
    verified: boolean;
}

export const getUserInfo = async (): Promise<allInfo> => {

    const response = await fetch(`${serverUrl}/user`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }
    const json = await response.json();
    return json as allInfo;
}