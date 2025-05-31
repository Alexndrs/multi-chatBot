import { EditableMessage } from "../editableMessage";

export function UserMessage({ message, onEdit, }: { message: string | null; onEdit: (newMessage: string | null) => void; }) {
    return (
        <div className="self-end mr-15 mt-5">
            <EditableMessage
                message={message}
                onEdit={onEdit}
            />
        </div>


    );
}