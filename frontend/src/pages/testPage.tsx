import { useConversationLogic } from "../hooks/useConversationLogic";
import { useUser } from "../hooks/useUser";
import ModalInput from "../components/input/modalInput";
import Input from "../components/input/input";


import { stripThinkTags } from "../utils";

import { MultiMessage } from "../components/message/multiMessage";


const TestPage: React.FC = () => {
    // Data management hooks
    const { conversation, getLinearizedGraph, addConversation, replyToMessage } = useConversationLogic();
    const { modalOpen, setModalOpen } = useUser();


    const linearizedGraph = getLinearizedGraph();
    const lastMessage = linearizedGraph[linearizedGraph.length - 1];

    const showInput = lastMessage && lastMessage.messages.length > 1;

    return (
        <div className="relative flex flex-col overflow-hidden h-screen">

            {modalOpen && (<ModalInput open={modalOpen} onClose={() => setModalOpen(false)} onSend={addConversation} />)}


            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-1 flex justify-center items-center z-20">



                <div className="flex-1 flex justify-center">
                    <h1>
                        {conversation ? stripThinkTags(conversation.convName) : "Hello, ask me anything!"}
                    </h1>
                </div>
                {conversation && (
                    <div className="absolute top-5 right-6">
                        <span className="smallText font-normal">
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
            <div className={`absolute left-1/2 transform -translate-x-1/2 mb-4 z-20
            ${showInput ? 'bottom-[-200px]' : 'bottom-5'}
            transition-all duration-300 ease-in-out
            `}>
                <Input onSend={async (message: string) => { await replyToMessage(message, []) }} />
            </div>

        </div>

    );
};

export default TestPage;