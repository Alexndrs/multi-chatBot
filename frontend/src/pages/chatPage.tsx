import { useRef, useEffect } from "react";
import Input from "../components/input/input";
import { UserMessage } from "../components/message/userMessage";
import { BotMessage } from "../components/message/botMessage";
import { useConv } from "../hooks/useConv";
import { useUser } from "../hooks/useUser";
import { createConversation, sendMessage } from "../api";
import type { Message } from "../contexts/convContext";
import type { ConversationItem } from "../components/sidebar/sideBar";
import ModalInput from "../components/modalInput";

const ChatPage: React.FC = () => {
    const { ConversationData, setConversationData, modalOpen, setModalOpen, modelName } = useConv();
    const { setUserData } = useUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setModalOpen(false);
            }
        };

        if (modalOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [ConversationData?.msgList, modalOpen, setModalOpen]);

    const appendMessage = (userMsg: Message, newMsg: Message) => {
        setConversationData((prev) => {
            if (prev && prev.convId === newMsg.convId) {
                return {
                    ...prev,
                    date: userMsg.timestamp,
                    msgList: [...(prev.msgList || []), userMsg, newMsg],
                };
            } else {
                return {
                    convId: newMsg.convId ?? null,
                    convName: newMsg.convName ?? null,
                    date: newMsg.timestamp,
                    msgList: [userMsg, newMsg],
                };
            }
        });
    };

    const updateAssistantReply = (chunk: string) => {
        setConversationData((prev) => {
            if (!prev || !prev.msgList) return prev;
            const updated = [...prev.msgList];
            const last = updated[updated.length - 1];

            if (last && last.role === "assistant") {
                updated[updated.length - 1] = {
                    ...last,
                    content: (last.content || "") + chunk,
                };
                return { ...prev, msgList: updated };
            }
            return prev;
        });
    };

    const createConvHandler = (conv: ConversationItem) => {
        setConversationData({ ...conv, msgList: [] });
        setUserData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: [...(prev.conversations || []), conv],
            };
        });
    };

    const updateConvTitle = (token: string, convId: string | null) => {
        if (!convId) return;

        setConversationData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                convName: (prev.convName || "") + token,
            };
        });

        setUserData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: (prev.conversations || []).map((conv) =>
                    conv.convId === convId
                        ? { ...conv, convName: (conv.convName || "") + token }
                        : conv
                ),
            };
        });
    };

    const updateTokenCount = (promptToken: number, responseToken: number) => {
        // Should update the last two message in conversationData
        setConversationData((prev) => {
            if (!prev || !prev.msgList) return prev;
            const updated = [...prev.msgList];
            const userMsg = updated[updated.length - 2];
            const assistantMsg = updated[updated.length - 1];

            if (userMsg && userMsg.role === "user") {
                updated[updated.length - 2] = {
                    ...userMsg,
                    token: promptToken,
                };
                console.log("test", userMsg, promptToken)
            }
            if (assistantMsg && assistantMsg.role === "assistant") {
                updated[updated.length - 1] = {
                    ...assistantMsg,
                    token: responseToken,
                };
            }
            return { ...prev, msgList: updated };
        });
    }

    const handleSendMessage = async (message: string) => {
        console.log("ConversationData :", ConversationData)
        let convId = ConversationData?.convId;

        if (!convId) {
            convId = await createConversation(message, modelName, createConvHandler, updateConvTitle);
            console.log("New conversation created with ID:", convId);
            // Timeout to ensure the generation of the message as started :
            setTimeout(() => {
                setModalOpen(false);
            }, 3000);
            if (!convId) return;
        }
        await sendMessage(convId, message, modelName, appendMessage, updateAssistantReply, updateTokenCount);
    };


    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-t from-[#12141b] to-[#191c2a]">
            <div className="relative h-16 flex justify-center items-center">
                <h1 className="text-3xl font-medium text-white font-playfair">
                    {ConversationData?.convName || "Hello, ask me anything!"}
                </h1>
                {ConversationData && (
                    <span className="absolute right-6 top-4 text-sm text-gray-400 font-normal">
                        {
                            // Sum of the tokens of the messages in the conversation
                            ConversationData.msgList?.reduce((acc, msg) => acc + (msg.token || 0), 0)
                        } tokens used
                    </span>
                )}
            </div>
            <ModalInput open={modalOpen} onClose={() => { setModalOpen(false) }} onSend={handleSendMessage} />
            <div className="flex flex-col overflow-y-auto p-4 h-full w-full hide-scrollbar scroll-smooth">
                {ConversationData?.msgList?.map((msg) =>
                    msg.role === "user" ? (
                        <UserMessage key={msg.msgId} message={msg.content} token={msg.token} onEdit={() => { }} />
                    ) : (
                        <BotMessage key={msg.msgId} message={msg.content} token={msg.token} onReload={() => { }} />
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center justify-between p-4 shadow-custom">
                <Input onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatPage;