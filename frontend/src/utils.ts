export function stripThinkTags(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
export function splitThinkContent(message: string | null): { content: string | null, thinkContent: string | null } {
    if (!message) return { content: null, thinkContent: null };

    const closedThinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const openThinkRegex = /<think>([\s\S]*)$/; // pour détecter balise non fermée

    const closedMatches = [...message.matchAll(closedThinkRegex)];
    let thinkContent = '';
    let content = message;

    if (closedMatches.length > 0) {
        thinkContent = closedMatches.map(match => match[1].trim()).join('\n');
        content = message.replace(closedThinkRegex, '').trim();
    } else {
        const openMatch = message.match(openThinkRegex);
        if (openMatch) {
            thinkContent = openMatch[1].trim();
            content = message.slice(0, openMatch.index).trim();
        }
    }

    return {
        content: content.length > 0 ? content : null,
        thinkContent: thinkContent.length > 0 ? thinkContent : null
    };
}

export function cn(...classes: (string | boolean | null | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}


export const apiList = [
    {
        api: 'openai',
        name: 'OpenAI',
        description: 'OpenAI API for language models and more.',
        icon: 'https://cdn.openai.com/api/logo.png',
        siteUrl: 'https://platform.openai.com/account/api-keys'
    },
    {
        api: 'claude',
        name: 'Anthropic',
        description: 'Anthropic API for AI models.',
        icon: 'https://www.anthropic.com/favicon.ico',
        siteUrl: 'https://console.anthropic.com/settings/keys'
    },
    {
        api: 'gemini',
        name: 'Google AI Studio',
        description: 'Google Cloud AI services.',
        icon: 'https://cloud.google.com/favicon.ico',
        siteUrl: 'https://aistudio.google.com/app/apikey'

    },
    {
        api: 'groq',
        name: 'Groq models',
        description: 'A lot of models from Groq.',
        icon: '',
        siteUrl: 'https://console.groq.com/keys'
    },
    {
        api: 'mistral',
        name: 'Mistral AI',
        description: 'Mistral AI models and services.',
        icon: 'https://mistral.ai/favicon.ico',
        siteUrl: 'https://console.mistral.ai/api-keys'
    }
]
