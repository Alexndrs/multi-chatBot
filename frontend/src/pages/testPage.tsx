import { useState, useRef } from "react";

import { useConversationLogic } from "../hooks/useConversationLogic";
import { useUser } from "../hooks/useUser";
import ModalInput from "../components/input/modalInput";
import Input from "../components/input/input";



import DropMenu from "../components/input/dropMenu";
import { stripThinkTags } from "../utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { MultiMessage } from "../components/message/multiMessage";


const TestPage: React.FC = () => {
    // Data management hooks
    const { conversation, getLinearizedGraph, addConversation, replyToMessage } = useConversationLogic();
    const { modalOpen, setModalOpen } = useUser();


    const linearizedGraph = getLinearizedGraph();
    const lastMessage = linearizedGraph[linearizedGraph.length - 1];

    const showInput = lastMessage && lastMessage.messages.length > 1;

    // UI state management
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div className="relative flex flex-col overflow-hidden h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-gray-200">

            {modalOpen && (<ModalInput open={modalOpen} onClose={() => setModalOpen(false)} onSend={addConversation} />)}


            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-1 flex justify-center items-center z-20">

                {/* Position a dropdown menu on top left for selecting model */}

                <div className="absolute top-2 left-15 z-30" ref={dropdownRef}>
                    <button
                        className="px-4 py-2 bg-white/3 text-white rounded-lg hover:bg-white/8 transition-all text-sm backdrop-blur-md"
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
                    <h1 className="text-xl font-medium text-white font-playfair">
                        {conversation ? stripThinkTags(conversation.convName) : "Hello, ask me anything!"}
                    </h1>
                </div>
                {conversation && (
                    <div className="absolute top-5 right-6">
                        <span className="text-sm text-gray-400 font-normal">
                            {'TODO'} tokens used
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-10 overflow-y-auto px-4 pt-[120px] pb-[300px] w-full hide-scrollbar mask-fade-bottom">

                {linearizedGraph.map((multiMessage, index) =>
                    <MultiMessage
                        key={index}
                        multiMessage={multiMessage}
                        isLast={index === linearizedGraph.length - 1}
                    />
                )}

            </div>

            {/* Show the input only if there is one message to answer (else user should merge or choose among the multiple message to continue) */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 mb-4 z-20 shadow-xl
            ${showInput ? 'bottom-[-200px]' : 'bottom-5'}
            transition-all duration-300 ease-in-out
            `}>
                <Input onSend={async (message: string) => { await replyToMessage(message, []) }} />
            </div>

        </div>

    );
};

export default TestPage;