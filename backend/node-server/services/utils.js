import { tokenizer } from './api_providers.js';

export const apis = {
    'groq': { isFree: true },
    'gemini': { isFree: true },
    'openai': { isFree: false },
    'claude': { isFree: false },
    'mistral': { isFree: false },
}


export const models = {
    'llama-3.1-8b-instant': { api: 'groq' },
    'qwen-qwq-32b': { api: 'groq' },
    'gemma2-9b-it': { api: 'groq' },
    'gemini-2.5-flash': { api: 'gemini' },
    'gemini-2.5-pro': { api: 'gemini' },
    'o4-mini-2025-04-16': { api: 'openai' },
    'gpt-4.1-nano-2025-04-14': { api: 'openai' },
    'claude-sonnet-4-20250514': { api: 'claude' },
    'claude-3-5-haiku-20241022': { api: 'claude' },
    'mistral-small-latest': { api: 'mistral' },
}

export const budget = {
    'llama-3.1-8b-instant': { RPM: 30, RPD: 14400, TPM: 6000, TPD: 500000 },
    'qwen-qwq-32b': { RPM: 30, RPD: 1000, TPM: 6000, TPD: 10000000 },
    'gemma2-9b-it': { RPM: 30, RPD: 14400, TPM: 15000, TPD: 500000 },
    'gemini-2.5-flash': { RPM: 10, RPD: 250, TPM: 250000, TPD: 10000000 },
    'gemini-2.5-pro': { RPM: 5, RPD: 100, TPM: 250000, TPD: 10000000 },
}



export function getMaxTokenInput(model_name) {
    if (!budget[model_name]) {
        return 4096;
    }
    const tpm = budget[model_name].TPM;
    const maxContextTokens = Math.floor(tpm * 0.5); // So the user can write up to 2 messages per minute with a full context
    return maxContextTokens;
}

export function getMaxModelOutput(model_name) {
    // the output is less than 40% of the TPM so the user can use it with a new long message of 60% of the TPM
    if (!budget[model_name]) {
        return 2048;
    }
    const tpm = budget[model_name].TPM;
    return Math.floor(tpm * 0.4);
}

/**
 * Apply a sliding windows on messages to take the most recent messages given a token budget.
 * @param {Array<{role: string, content: string}>} messages 
 * @param {number} maxTokenBudget 
 * @returns {Array<{role: string, content: string}>}
 */
export function applySlidingWindow(messages, maxTokenBudget) {
    const reversed = [...messages].reverse(); // start from the most recent message
    const selected = [];
    let totalTokens = 0;

    for (const msg of reversed) {
        const formatted = `<|start_header_id|>${msg.role}<|end_header_id|>\n${msg.content}<|eot_id|>`;
        const tokenCount = tokenizer.encode(formatted).length;

        if (totalTokens + tokenCount > maxTokenBudget) break;

        selected.push(msg);
        totalTokens += tokenCount;
    }

    return selected.reverse();
}
