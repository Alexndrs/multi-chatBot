import ButtonIcon from './buttonIcon';
import { useEffect, useState, useRef } from "react";
import { Edit, Check, Undo2 } from 'lucide-react';


export function EditableMessage({ message, onEdit, }: { message: string; onEdit: (newMessage: string) => void; }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message)
    const [displayMessage, setDisplayMessage] = useState(message)
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEdit = () => {
        // TODO : Forbid empty messages
        if (editedMessage.trim() === "") {
            setEditedMessage(displayMessage);
            return;
        }
        onEdit(editedMessage);
        setDisplayMessage(editedMessage);
        setIsEditing(false);
    };

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [isEditing]);

    return (
        <div className="flex flex-col w-full min-w-[25vw] max-w-[50vw] bg-[var(--color-onTop)] border-[var(--color-onTop)] shadow-lg border-t-2 p-4 rounded-lg">
            {isEditing ? (
                <div className="flex flex-col w-auto">
                    <textarea
                        ref={textareaRef}
                        className="w-auto px-3 rounded-lg outline-none focus:none resize-none min-h-[48px] overflow-auto"
                        value={editedMessage ? editedMessage : ""}
                        onChange={(e) => {
                            setEditedMessage(e.target.value)
                            if (textareaRef.current) {
                                textareaRef.current.style.height = "auto";
                                textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
                            }
                        }

                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEdit();
                            }
                        }}>
                        {editedMessage}
                    </textarea>
                    <div className="flex justify-end gap-0">
                        <ButtonIcon
                            icon={<Undo2 size={16} />}
                            text=''
                            onClick={() => {
                                setIsEditing(false);
                                setEditedMessage(displayMessage);
                            }}
                            type="transparent" />
                        <ButtonIcon
                            icon={<Check size={16} />}
                            text=''
                            onClick={handleEdit}
                            type="transparent" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <p
                        className="w-auto p-2 rounded-lg break-words whitespace-pre-line">

                        {displayMessage}
                    </p>
                    <div className="flex justify-end">
                        <ButtonIcon
                            icon={<Edit size={16} />}
                            text=""
                            onClick={() => { setIsEditing(true); }}
                            type="transparent" />
                    </div>
                </div>
            )
            }

        </div >
    );
}
