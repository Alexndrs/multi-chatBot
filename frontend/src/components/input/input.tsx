import ButtonIcon from "../buttonIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisVertical, faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import FloatingMenu from "./floatingMenu";
import { useState } from "react";


export default function Input({ onSend, }: { onSend: (message: string) => void; }) {

    const [openMenu, setOpenMenu] = useState<"task" | "upload" | null>(null);
    const [isGlowingLoop, setIsGlowingLoop] = useState(false);



    const sendMessage = async () => {
        if (isGlowingLoop) return;
        const input = document.querySelector("input") as HTMLInputElement;
        if (input) {
            setIsGlowingLoop(true);
            await onSend(input.value);
            input.value = "";
            setIsGlowingLoop(false);
        }
    }


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (isGlowingLoop) return;
            sendMessage();
        }
    };


    return (
        <div className="flex flex-col ml-auto mr-auto">
            <div className="flex gap-2 ml-auto mr-auto sm:w-[70vw] items-center justify-between border-2 border-gray-800 rounded-lg focus:outline-none focus:border-gray-700 p-2">
                <div className="relative">
                    <ButtonIcon
                        icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                        onClick={() => setOpenMenu(openMenu === "task" ? null : "task")}
                        type="transparent"
                    />
                    {openMenu === "task" && (
                        <FloatingMenu
                            items={["Text-to-Text", "Text-to-Image", "Audio-to-Text"]}
                            onSelect={(v) => {
                                alert(`Selected task: ${v}`);
                                setOpenMenu(null);
                            }}
                            onClose={() => setOpenMenu(null)}
                        />
                    )}
                </div>
                <div className="relative">
                    <ButtonIcon
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => setOpenMenu(openMenu === "upload" ? null : "upload")}
                        type="transparent" />
                    {openMenu === "upload" && (
                        <FloatingMenu
                            items={["Upload image", "Upload document"]}
                            onSelect={(v) => {
                                alert(`Selected upload: ${v}`);
                                setOpenMenu(null);
                            }}
                            onClose={() => setOpenMenu(null)}
                        />
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Type your message here..."
                    className="flex-1 p-2 mr-2 rounded-lg focus:outline-none resize-none text-gray-400"
                    onKeyDown={handleKeyDown}
                    disabled={isGlowingLoop}

                />
                <ButtonIcon
                    icon={
                        isGlowingLoop ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                            <FontAwesomeIcon icon={faArrowUp} />
                        )
                    }
                    onClick={() => {
                        if (!isGlowingLoop) {
                            sendMessage();
                        }
                    }}
                    type={isGlowingLoop ? "deactivated" : "primary"} />
            </div>
            {/* Infos */}
            <div className="flex items-center gap-2 mt-2">
                <div className="bg-amber-400 hover:bg-amber-300 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">Text-2-Text</div>
                <div className="bg-pink-300 hover:bg-pink-200 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">Qwen-0.6B</div>
            </div>
        </div>
    );
}