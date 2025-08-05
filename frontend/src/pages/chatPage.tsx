import { useConversationLogic } from "../hooks/useConversationLogic";
import { useUser } from "../hooks/useUser";
import ModalInput from "../components/input/modalInput";
import Input from "../components/input/input";
import { useState } from "react";
import ModalError from "../components/modalError";


import { stripThinkTags } from "../utils";

import { MultiMessage } from "../components/message/multiMessage";
import type { linearConversation } from "../api/types";


const ChatPage: React.FC = () => {
    // Data management hooks
    const { conversation, getLinearizedGraph, addConversation, replyToMessage } = useConversationLogic();

    // User interface hooks
    const { modalOpen, setModalOpen } = useUser();
    const [error, setError] = useState<string | null>(null);


    let linearizedGraph: linearConversation = [];
    let lastMessage = null;
    try {
        linearizedGraph = getLinearizedGraph();
        lastMessage = linearizedGraph[linearizedGraph.length - 1];
    }
    catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred");
    }

    const showInput = lastMessage && lastMessage.messages.length == 1 || lastMessage == null;

    const handleAddConversation = async (message: string) => {
        try {
            await addConversation(message);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unexpected error occurred");
        }
    }


    const handleReply = async (message: string) => {
        try {
            await replyToMessage(message, []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unexpected error occurred");
        }
    }

    return (
        <div className="relative flex flex-col overflow-hidden h-screen">
            {error && <ModalError errorMessage={error} onClose={() => setError(null)} />}

            {modalOpen && (<ModalInput open={modalOpen} onClose={() => setModalOpen(false)} onSend={handleAddConversation} />)}

            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-1 flex justify-center items-center z-0">
                <div className="flex-1 flex justify-center mx-12">
                    <h1>
                        {conversation ? stripThinkTags(conversation.convName) : "Hello, ask me anything!"}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-10 overflow-y-auto px-4 pt-[120px] pb-[300px] w-full hide-scrollbar mask-fade-bottom">

                {linearizedGraph.map((multiMessage, index) =>
                    <MultiMessage
                        key={index}
                        multiMessage={multiMessage}
                        isLast={index === linearizedGraph.length - 1}
                        setError={(error: string | null) => setError(error)}
                    />
                )}

            </div>

            {/* Show the input only if there is one message to answer (else user should merge or choose among the multiple message to continue) */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 mb-4 z-20
            ${!showInput ? 'bottom-[-250px]' : 'bottom-4'}
            transition-all duration-300 ease-in-out
            `}>
                <Input onSend={handleReply} />
            </div>

        </div>

    );
};

export default ChatPage;