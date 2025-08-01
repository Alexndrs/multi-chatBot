import ButtonIcon from "../buttonIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faSpinner, faArrowUp } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
import FloatingMenu from "./floatingMenu";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useUser } from "../../hooks/useUser";

import { motion } from "framer-motion";


export default function ModalInput({ open, onClose, onSend }: { open: boolean; onClose: () => void, onSend: (message: string) => void; }) {
    const { selectedModel } = useUser();

    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const modelSelectorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const [isGlowingLoop, setIsGlowingLoop] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsGlowingLoop(false);
        }
    }, [open]);




    if (!open) return null;


    const sendMessage = (msg?: string) => {
        if (msg) {
            const input = document.querySelector("input") as HTMLInputElement;
            // Set input value to the message if provided
            if (input) {
                input.value = msg;
            }
            onSend(msg);
        }
        else {
            const input = document.querySelector("input") as HTMLInputElement;
            if (input) {
                onSend(input.value);
            }
        }
        setIsGlowingLoop(true);
    }


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-[90vw] md:w-[75vw] rounded-lg bg-linear-to-t shadow-lg border-t-2 border-white/20 z-9 flex flex-col relative"
            >
                {isGlowingLoop && (
                    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                        <div className="absolute w-[200%] h-[200%] bg-white opacity-10 blur-3xl rotate-45 animate-shineLoop" />
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0, duration: 1, ease: "easeIn" }}
                    className="absolute top-0 left-0 h-[2.5px] right-0 z-20 pointer-events-none"
                >
                    {/* Couche nette */}
                    <div className="left-[15%] right-[15%] h-full absolute blur-sm opacity-90 gradientMove z-22" />

                    <div className="left-[12%] right-[12%] h-full absolute blur-md opacity-90 gradientMove z-22" />

                    <div className="left-[8%] right-[8%] h-full absolute blur-lg opacity-90 gradientMove z-21" />

                    {/* Couche halo diffus */}
                    <div className="left-[4%] right-[4%] h-full absolute blur-xl opacity-40 gradientMove z-20" />

                    <div className="left-[1%] right-[1%] absolute blur-2xl opacity-40 gradientMove z-20 gradientMove" />
                    <div className="w-full h-full absolute blur-3xl opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[50px] opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[60px] opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[70px] opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[80px] opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[90px] opacity-40 gradientMove z-20" />
                    <div className="w-full h-full absolute blur-[100px] opacity-40 gradientMove z-20" />

                </motion.div>


                <div className="rounded-lg bg-[#171c23] shadow-lg py-6 z-10">
                    <div className="flex flex-col ml-auto mr-auto">
                        <div className="flex gap-2 w-full mb-0 items-center justify-between rounded-lg focus:outline-none p-2 border-b-[3px] border-b-black/20">

                            <div ref={modelSelectorRef} className="ml-2 shrink-0">
                                <ButtonIcon
                                    icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                                    onClick={() => handleMenuOpen(modelSelectorRef)}
                                    type="transparent"
                                />
                            </div>

                            {/* <div ref={uploadButtonRef}>
                                <ButtonIcon
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={() => handleMenuOpen("upload", uploadButtonRef)}
                                    type="transparent" />
                            </div> */}

                            <input
                                type="text"
                                placeholder="Type your message here..."
                                className="flex-1 p-2 rounded-lg focus:outline-none resize-none text-gray-400"
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
                        <div className="flex flex-wrap px-6 justify-between mt-0 pt-5 border-t-2 border-white/7">
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                                {selectedModel.map((model, index) => (
                                    <div key={`${model}-${index}`} className="bg-pink-300 hover:bg-pink-200 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{model}</div>
                                ))}
                            </div>
                            {/* Hide example on sm screen */}
                            <div className="hidden md:flex items-center gap-2 max-w-[50%] flex-shrink-0">
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default"
                                    onClick={() => { sendMessage("Give me a recipe for 20 cookies") }}
                                >
                                    Give me a recipe for 20 cookies</div>
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default text-ellipsis"
                                    onClick={() => { sendMessage("what's DP algorithm") }}
                                >what's DP algorithm</div>
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default"
                                    onClick={() => { sendMessage("Tell me the taylor formula") }}
                                >Tell me the taylor formula</div>
                            </div>
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
        </div>
    );
}