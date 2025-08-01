import { useState, useRef } from "react";

import { useConversationLogic } from "../hooks/useConversationLogic";
import { useUser } from "../hooks/useUser";
import ModalInput from "../components/input/modalInput";
import Input from "../components/input/input";



import DropMenu from "../components/input/dropMenu";
import { stripThinkTags } from "../utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';


const TestPage: React.FC = () => {
    // Data management hooks
    const { conversation, getLinearizedGraph } = useConversationLogic();
    const { modalOpen, setModalOpen } = useUser();



    // UI state management
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div className="relative flex flex-col overflow-hidden h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-gray-200">

            {modalOpen && (<ModalInput open={modalOpen} onClose={() => setModalOpen(false)} onSend={() => { }} />)}


            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-5 flex justify-center items-center z-20">

                {/* Position a dropdown menu on top left for selecting model */}

                <div className="absolute top-8 left-20 z-30" ref={dropdownRef}>
                    <button
                        className="px-4 py-2 bg-white/3 text-white rounded-lg hover:bg-white/8 transition-all text-sm"
                        onClick={() => {
                            setOpenMenu(!openMenu);
                        }}
                    >
                        {openMenu
                            ? <FontAwesomeIcon icon={faChevronDown} className="mr-2" size="xs" />
                            : <FontAwesomeIcon icon={faChevronUp} className="mr-2" size="xs" />}
                        Select Model
                    </button>
                    {openMenu && (
                        <div className="absolute top-full left-0 mt-2">
                            <DropMenu
                                onSelect={() => { }}
                                onClose={() => setOpenMenu(false)}
                                containerRef={dropdownRef}
                            />
                        </div>
                    )}
                </div>


                <div className="flex-1 flex justify-center">
                    <h1 className="text-3xl font-medium text-white font-playfair">
                        {conversation ? stripThinkTags(conversation.convName) : "Hello, ask me anything!"}
                    </h1>
                </div>
                {/* {conversation && (
                    <div className="absolute top-5 right-6">
                        <span className="text-sm text-gray-400 font-normal">
                            {
                                conversation.msgList?.reduce((acc, msg) => {
                                    return acc + (msg.token + (msg.historyTokens ?? 0))
                                }, 0)
                            } tokens used
                        </span>
                    </div>
                )} */}
            </div>


            {getLinearizedGraph().map((multiMessage, index) => (
                <div className="flex p-4 bg-white/5" key={index}>
                    {multiMessage.messages.map((message, msgIndex) => (
                        <div key={msgIndex} className="flex flex-col py-4 px-6 m-2 gap-2 bg-white/5 rounded-lg">
                            <div className="text-sm font-semibold pb-2 border-b-1 border-white/5">{message.role === 'user' ? 'user' : message.author}</div>
                            <div className="text-sm text-blue-300">[THINK CONTENT] {message.thinkContent}</div>
                            <div className="text-sm">[MAIN CONTENT] {message.mainContent}</div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mb-4 z-20 bg-gradient-to-t from-[#12141b] to-transparent shadow-xl">
                <Input onSend={async (message: string) => { console.log('Sending message', message) }} />
            </div>

        </div>

    );
};

export default TestPage;