import { EditableMessage } from "../editableMessage";

export function UserMessage({
    message,
    onEdit,
    token,
    historyTokens }: {
        message: string;
        onEdit: (newMessage: string) => void;
        token: number;
        historyTokens?: number;
    }) {
    return (
        <div className="self-end sm:mr-0 md:mr-40 mt-5">
            <EditableMessage
                message={message}
                onEdit={onEdit}
            />
            {token > 0 && (
                <div className="smallText italic text-right pr-2 mt-1">
                    {token} tokens {(historyTokens !== undefined) && (historyTokens > 0) ? ` | ${historyTokens} tokens from history context` : ''}
                </div>)
            }
        </div>
    );
}