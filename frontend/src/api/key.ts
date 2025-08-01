import { serverUrl } from './config';
import { getToken } from './user';
import type { ApiKey } from './types';

export const addKey = async (api: string, key: string): Promise<string> => {
    const response = await fetch(`${serverUrl}/key`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ api, key })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`${error.message || 'Failed to add API key'}`);
    }
    const json = await response.json();
    return json.message as string;
}


export const deleteKey = async (api: string): Promise<void> => {
    const response = await fetch(`${serverUrl}/key/${api}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`${error.message || 'Failed to delete API key'}`);
    }
    return;
}



export const getApiKeys = async (): Promise<ApiKey[]> => {
    const response = await fetch(`${serverUrl}/key`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch API keys');
    }
    const json = await response.json();
    return json as ApiKey[];
}