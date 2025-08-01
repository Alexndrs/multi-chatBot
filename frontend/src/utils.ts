export function stripThinkTags(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
export function splitThinkContent(message: string): { mainContent: string, thinkContent: string } {
    if (message === '') return { mainContent: '', thinkContent: '' };

    const closedThinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const openThinkRegex = /<think>([\s\S]*)$/; // pour détecter balise non fermée

    const closedMatches = [...message.matchAll(closedThinkRegex)];
    let thinkContent = '';
    let mainContent = message;

    if (closedMatches.length > 0) {
        thinkContent = closedMatches.map(match => match[1].trim()).join('\n');
        mainContent = message.replace(closedThinkRegex, '').trim();
    } else {
        const openMatch = message.match(openThinkRegex);
        if (openMatch) {
            thinkContent = openMatch[1].trim();
            mainContent = message.slice(0, openMatch.index).trim();
        }
    }

    return { mainContent, thinkContent };
}

export function cn(...classes: (string | boolean | null | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}


interface HttpError {
    status: number;
    message?: string;
}

// verify if an error is HttpError
export function isHttpError(error: unknown): error is HttpError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        typeof (error as Record<string, unknown>).status === 'number'
    );
}

// verify if an error is HttpError with a specific status
export function isHttpErrorWithStatus(error: unknown, status: number): boolean {
    return isHttpError(error) && error.status === status;
}

// verify if an error is UnauthorizedError (status 403)
export function isUnauthorizedError(error: unknown): boolean {
    return isHttpErrorWithStatus(error, 403);
}

// get the status from an error if it is HttpError, otherwise return null
export function getErrorStatus(error: unknown): number | null {
    return isHttpError(error) ? error.status : null;
}