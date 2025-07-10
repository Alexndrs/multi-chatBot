import Button from './button';
import ButtonIcon from './buttonIcon';
import { useEffect, useState, useRef } from "react";
import { Edit } from 'lucide-react';


export function EditableMessage({ message, onEdit, }: { message: string | null; onEdit: (newMessage: string | null) => void; }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message)
    const [displayMessage, setDisplayMessage] = useState(message)
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEdit = () => {
        // TODO : Forbid empty messages
        if (editedMessage === null || editedMessage.trim() === "") {
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
        <div className="flex flex-col w-fit min-w-[25vw] max-w-[50vw] bg-slate-300/3 shadow-lg border-t-2 border-white/7 p-4 rounded-lg">
            {isEditing ? (
                <div className="flex flex-col w-auto">
                    <textarea
                        ref={textareaRef}
                        className="w-auto p-3 rounded-lg outline-none focus:none resize-none text-gray-200 min-h-[48px] overflow-auto"
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
                    <div className="flex justify-end gap-2">
                        <Button
                            text="Cancel"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedMessage(displayMessage);
                            }}
                            type="white" />
                        <Button
                            text="Save"
                            onClick={handleEdit}
                            type="primary" />
                    </div>
                </div>
            ) : (
                <div className="relative flex flex-col w-auto">
                    <p
                        className="w-auto p-2 rounded-lg text-gray-200 break-words whitespace-pre-line">

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
