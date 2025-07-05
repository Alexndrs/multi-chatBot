import { EditableMessage } from "../editableMessage";

export function UserMessage({
    message,
    onEdit,
    token }: {
        message: string | null;
        onEdit: (newMessage: string | null) => void;
        token: number
    }) {
    return (
        <div className="self-end mr-15 mt-5">
            <EditableMessage
                message={message}
                onEdit={onEdit}
            />
            {token > 0 && (
                <div className="text-[10px] text-gray-500 italic text-right pr-2 mt-1">
                    {token} tokens (message + history)
                </div>)
            }
        </div>
    );
}