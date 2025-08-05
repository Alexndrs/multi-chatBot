import ButtonIcon from "../buttonIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faSpinner, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import FloatingMenu from "./floatingMenu";
import { createPortal } from "react-dom";


export default function Input({ isNeon, onSend }: { isNeon?: boolean, onSend: (message: string) => Promise<void>; }) {
    const { selectedModel } = useUser();
    const [isGlowingLoop, setIsGlowingLoop] = useState(false);
    const modelSelectorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [openMenu, setOpenMenu] = useState<boolean>(false);



    const sendMessage = async (txt?: string): Promise<void> => {
        if (isGlowingLoop) return;
        const textArea = document.querySelector("textarea") as HTMLTextAreaElement;
        if (textArea || txt) {
            if (txt) {
                textArea.value = txt;
            }
            setIsGlowingLoop(true);
            await onSend(textArea.value);
            textArea.value = "";
            setIsGlowingLoop(false);
        }
    }


    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (isGlowingLoop) return;
            sendMessage();
        }
    };

    const handleMenuOpen = (buttonRef: React.RefObject<HTMLDivElement>) => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                x: rect.left,
                y: rect.top - 10 // Ajustement pour positionner au-dessus
            });
        }
        setOpenMenu(true);
    };


    return (<>

        <motion.div
            className="flex flex-col ml-auto mr-auto rounded-lg bg-[var(--color-onTop)] pb-4 z-10 border-t-2 border-[var(--color-onTop)] backdrop-blur-2xl shadow-xl"
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {isGlowingLoop && (
                <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                    <div className="absolute w-[200%] h-[200%] bg-white opacity-10 blur-3xl rotate-45 animate-shineLoop" />
                </div>
            )}

            {isNeon && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0, duration: 1, ease: "easeIn" }}
                    className="absolute top-0 left-0 h-[2.5px] right-0 z-20 pointer-events-none"
                >
                    <div className="neon-bar-enhanced w-[100%] h-full absolute" />
                </motion.div>

            )}

            <div className="flex flex-col ml-auto mr-auto">
                <div className="flex gap-2 px-6 ml-auto mr-auto mb-0 sm:w-[70vw] items-center justify-between focus:outline-none border-b-3 py-1 border-b-black/20">

                    <div ref={modelSelectorRef} className="ml-2 shrink-0">
                        <ButtonIcon
                            icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                            onClick={() => handleMenuOpen(modelSelectorRef)}
                            type="transparent"
                        />
                    </div>

                    <textarea
                        placeholder="Type your message here..."
                        className="flex-1 px-6 pt-6 pb-8 mr-2 focus:outline-none resize-none placeholder:opacity-50 hide-scrollbar"
                        onKeyDown={handleKeyDown}
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
                <div className="flex flex-wrap px-6 justify-between mt-0 pt-5 border-t-2 border-[var(--color-onTop)]">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                        {selectedModel.map((model, index) => (
                            <div key={`${model}-${index}`} className="bg-pink-300 hover:bg-pink-200 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{model}</div>
                        ))}
                    </div>
                    {/* Hide example on sm screen */}
                    <div className="hidden md:flex items-center gap-2 max-w-[50%] flex-shrink-0">
                        <div
                            className=" smallText border-1 border-dashed border-[var(--color-smallTextColor)] px-3 py-1 rounded-xl hover:text-[var(--color-regularTextColor)] hover:border-regularTextColor transition duration-150 cursor-default"
                            onClick={() => { sendMessage("Give me a recipe for 20 cookies") }}
                        >
                            Give me a recipe for 20 cookies</div>
                        <div
                            className=" smallText border-1 border-dashed border-[var(--color-smallTextColor)] px-3 py-1 rounded-xl hover:text-[var(--color-regularTextColor)] hover:border-regularTextColor transition duration-150 cursor-default"
                            onClick={() => { sendMessage("Tell me the taylor formula") }}
                        >Tell me the taylor formula</div>
                    </div>
                </div>
            </div>
        </motion.div>
        {openMenu && createPortal(
            <div
                style={{
                    position: 'fixed',
                    left: menuPosition.x,
                    top: menuPosition.y,
                    transform: 'translateY(-100%)',
                    zIndex: 9999
                }}
            >
                <FloatingMenu
                    onSelect={() => { }}
                    onClose={() => setOpenMenu(false)}
                />
            </div>,
            document.body
        )}
    </>
    );
}