/// <reference path="../core/types.js" />
import { tokenizer } from './api_providers.js';

export const apis = {
    'groq': { isFree: true, name: 'Groq models', url: 'https://console.groq.com/keys' },
    'gemini': { isFree: true, name: 'Google AI studio', url: 'https://aistudio.google.com/app/apikey' },
    'openai': { isFree: false, name: 'OpenAI', url: 'https://platform.openai.com/account/api-keys' },
    'claude': { isFree: false, name: 'Anthropic', url: 'https://console.anthropic.com/keys' },
    'mistral': { isFree: false, name: 'Mistral', url: 'https://mistral.ai/api-keys' },
}


export const models = {
    'llama-3.1-8b-instant': { api: 'groq', budget: { RPM: 30, RPD: 14400, TPM: 6000, TPD: 500000 }, task: 'text-2-text' },
    'qwen/qwen3-32b': { api: 'groq', budget: { RPM: 60, RPD: 1000, TPM: 6000, TPD: 500000 }, task: 'text-2-text' },
    'gemma2-9b-it': { api: 'groq', budget: { RPM: 30, RPD: 14400, TPM: 15000, TPD: 500000 }, task: 'text-2-text' },
    'gemini-2.5-flash': { api: 'gemini', budget: { RPM: 10, RPD: 250, TPM: 250000, TPD: 10000000 }, task: 'multimodal-2-text' },
    'gemini-2.5-pro': { api: 'gemini', budget: { RPM: 5, RPD: 100, TPM: 250000, TPD: 10000000 }, task: 'multimodal-2-text' },
    'o4-mini-2025-04-16': { api: 'openai', task: 'multimodal-2-text' },
    'gpt-4.1-nano-2025-04-14': { api: 'openai', task: 'multimodal-2-text' },
    'claude-sonnet-4-20250514': { api: 'claude', task: 'multimodal-2-text' },
    'claude-3-5-haiku-20241022': { api: 'claude', task: 'text-2-text' },
    'mistral-small-latest': { api: 'mistral', task: 'multimodal-2-text' },
}

export function getMaxTokenInput(model_name) {
    if (!models[model_name]?.budget) {
        return 4096;
    }
    const tpm = models[model_name].budget.TPM;
    const maxContextTokens = Math.floor(tpm * 0.5); // So the user can write up to 2 messages per minute with a full context
    return maxContextTokens;
}

export function getMaxModelOutput(model_name) {
    // the output is less than 40% of the TPM so the user can use it with a new long message of 60% of the TPM
    if (!models[model_name]?.budget) {
        return 2048;
    }
    const tpm = models[model_name].budget.TPM;
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


/**
 * Génère une chaîne de caractères au format Mermaid pour visualiser un graphe de conversation.
 * @param {Graph} graphData - L'objet graphe contenant messagesMap.
 * @returns {string} - La chaîne de caractères formatée pour un bloc de code Mermaid.
 */
export function generateMermaidGraph(graphData) {
    const { messagesMap } = graphData;
    const mermaidLines = ['graph TD;']; // TD = Top Down, pour un affichage de haut en bas

    // Utilisons un Set pour éviter de redéfinir les liens si l'information est redondante
    const links = new Set();

    for (const msgId in messagesMap) {
        const node = messagesMap[msgId];
        const content = node.message.content;
        // replace " to ' 
        const shortMsg = content.substring(0, 250).replace(/"/g, "'");
        // Définit le texte du nœud (ex: "a7151e99...")
        mermaidLines.push(`    ${msgId}["${shortMsg}"];`);

        // Crée les liens vers les enfants
        if (node.children && node.children.length > 0) {
            for (const childId of node.children) {
                links.add(`    ${msgId} --> ${childId};`);
            }
        }
    }

    // Ajoute les lignes de liens au code final
    mermaidLines.push(...links);

    // Retourne le tout dans un bloc de code prêt à l'emploi
    return '```mermaid\n' + mermaidLines.join('\n') + '\n```';
}