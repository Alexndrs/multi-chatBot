import ButtonIcon from "./buttonIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faSpinner, faArrowUp } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
import FloatingMenu from "./input/floatingMenu";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useConv } from "../hooks/useConv";



export default function ModalInput({ open, onClose, onSend }: { open: boolean; onClose: () => void, onSend: (message: string) => void; }) {
    const { task, modelName } = useConv();
    const [openMenu, setOpenMenu] = useState<"task" | "upload" | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const taskButtonRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    // const uploadButtonRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
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

    const handleMenuOpen = (menuType: "task" | "upload", buttonRef: React.RefObject<HTMLDivElement>) => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                x: rect.left,
                y: rect.top - 10 // Ajustement pour positionner au-dessus
            });
        }
        setOpenMenu(openMenu === menuType ? null : menuType);
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="w-[75vw] rounded-lg bg-linear-to-t from-[#171c23] to-[#ffffff69] shadow-lg p-[1px] z-9 flex flex-col relative">
                {isGlowingLoop && (
                    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                        <div className="absolute w-[200%] h-[200%] bg-white opacity-10 blur-3xl rotate-45 animate-shineLoop" />
                    </div>
                )}


                <div className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none">
                    {/* Couche nette */}
                    <div className="left-[15%] right-[15%] h-full absolute blur-sm opacity-90 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-22" />

                    <div className="left-[12%] right-[12%] h-full absolute blur-md opacity-90 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-22" />

                    <div className="left-[8%] right-[8%] h-full absolute blur-lg opacity-90 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-21" />

                    {/* Couche halo diffus */}
                    <div className="left-[4%] right-[4%] h-full absolute blur-xl opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />

                    <div className="left-[1%] right-[1%] absolute blur-2xl opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-3xl opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[50px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[60px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[70px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[80px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[90px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                    <div className="w-full h-full absolute blur-[100px] opacity-40 bg-[length:300%] bg-[linear-gradient(to_right,_#00f0ff,_#00ff6e,_#ffff00,_#ff9900,_#ff00e1,_#7200ff,_#00f0ff)] z-20" />
                </div>


                <div className="rounded-lg bg-[#171c23] shadow-lg p-6 z-10">
                    <div className="flex flex-col ml-auto mr-auto">
                        <div className="flex gap-2 ml-auto mr-auto sm:w-[70vw] items-center justify-between rounded-lg focus:outline-none p-2">

                            <div ref={taskButtonRef}>
                                <ButtonIcon
                                    icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                                    onClick={() => handleMenuOpen("task", taskButtonRef)}
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
                                className="flex-1 p-2 mr-2 rounded-lg focus:outline-none resize-none text-gray-400"
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
                        <div className="flex flex-wrap justify-between mt-2 pt-5 border-t-1 border-[#ffffff16]">
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                                <div className="bg-amber-400 hover:bg-amber-300 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{task}</div>
                                <div className="bg-pink-300 hover:bg-pink-200 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{modelName}</div>
                            </div>
                            <div className="flex items-center gap-2 max-w-[50%] flex-shrink-0">
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default"
                                    onClick={() => { sendMessage("Give me a recipe for 20 cookies") }}
                                >
                                    Give me a recipe for 20 cookies</div>
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default"
                                    onClick={() => { sendMessage("Tell me the taylor formula with integral remainder") }}
                                >Tell me the taylor formula with integral rest</div>
                                <div
                                    className=" text-gray-400 border-1 border-dashed border-gray-400 px-3 py-1 rounded-xl text-xs hover:text-gray-200 hover:border-gray-200 transition duration-150 cursor-default"
                                    onClick={() => { sendMessage("what's DP algorithm") }}
                                >what's DP algorithm</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {openMenu === "task" && createPortal(
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
                        onSelect={() => {
                            setOpenMenu(null);
                        }}
                        onClose={() => setOpenMenu(null)}
                    />
                </div>,
                document.body
            )}

            {/* {openMenu === "upload" && createPortal(
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
                        items={["Upload image", "Upload document"]}
                        onSelect={(v) => {
                            alert(`Selected upload: ${v}`);
                            setOpenMenu(null);
                        }}
                        onClose={() => setOpenMenu(null)}
                    />
                </div>,
                document.body
            )} */}
        </div>
    );
}