import ButtonIcon from "../buttonIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useConv } from "../../hooks/useConv";
import { motion } from "framer-motion";


export default function Input({ onSend, }: { onSend: (message: string) => void; }) {
    const { task, selectedModel } = useConv();
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


    return (<>

        <motion.div
            className="flex flex-col ml-auto mr-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >

            <div className="rounded-lg bg-slate-300/3 py-4 z-10 border-t-2 border-white/7 backdrop-blur-2xl">
                <div className="flex flex-col ml-auto mr-auto">
                    <div className="flex gap-2 px-6 ml-auto mr-auto mb-0 sm:w-[70vw] items-center justify-between rounded-lg focus:outline-none p-2 border-b-3 border-b-black/20">

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
                    <div className="flex flex-wrap px-6 justify-between mt-0 pt-5 border-t-2 border-white/7">
                        <div className="flex items-center gap-2 flex-wrap flex-1">
                            <div className="bg-amber-400 hover:bg-amber-300 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{task}</div>
                            {selectedModel.map((model, index) => (
                                <div key={`${model}-${index}`} className="bg-pink-300 hover:bg-pink-200 text-gray-800 px-3 py-1 rounded-lg text-xs transition duration-150 cursor-default">{model}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </>
    );
}