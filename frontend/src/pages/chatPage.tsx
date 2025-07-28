import { useRef, useEffect, useState } from "react";

import Input from "../components/input/input";
import { UserMessage } from "../components/message/userMessage";
import { BotMessage } from "../components/message/botMessage";
import ModalInput from "../components/input/modalInput";
import { stripThinkTags } from "../utils";

import { useConv } from "../hooks/useConv";
import { useChatLogic } from "../hooks/useChatLogic";


const ChatPage: React.FC = () => {
    // Data management hooks
    const { conversation, modalOpen, setModalOpen } = useConv();
    const { sendUserMessage, editMessage, reloadBotMessage } = useChatLogic();

    // UI state management
    const [error, setError] = useState<string | null>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // UI effects
    useEffect(() => {
        if (!error || !errorRef.current) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (errorRef.current && !errorRef.current.contains(event.target as Node)) {
                setError(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [error]);

    useEffect(() => {
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
    }, [modalOpen, setModalOpen]);

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const timeoutId = setTimeout(scrollToBottom, 100);

        return () => clearTimeout(timeoutId);
    }, [conversation?.msgList?.length]);



    // Handlers
    const handleUserSubmit = async (message: string) => {
        setError(null);
        try {
            await sendUserMessage(message);
        } catch (err) {
            console.error("Error sending message:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };


    const handleMessageEdit = async (newContent: string | null, msgId: string | null) => {
        if (!newContent?.trim()) return;
        if (!msgId) {
            setError("Message ID is required for editing.");
            return;
        }
        try {
            await editMessage(newContent, msgId);
        } catch (err) {
            console.error("Error editing message:", err);
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    };




    const handleBotMessageReload = async (msgId: string | null) => {
        try {
            await reloadBotMessage(msgId);
        } catch (err) {
            console.error("Error reloading message:", err);
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    };


    return (
        <div className="relative flex flex-col overflow-hidden h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a]">

            {/* Header */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-5 flex justify-center items-center z-20 backdrop-blur-md">
                <h1 className="text-3xl pl-20 md:pl-0 font-medium text-white font-playfair">
                    {conversation ? stripThinkTags(conversation.convName || "") : "Hello, ask me anything!"}
                </h1>
                {conversation && (
                    <span className="absolute right-6 top-4 text-sm text-gray-400 font-normal">
                        {
                            conversation.msgList?.reduce((acc, msg) => {
                                return acc + (msg.token + (msg.historyTokens ?? 0))
                            }, 0)
                        } tokens used
                    </span>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (<ModalInput open={modalOpen} onClose={() => setModalOpen(false)} onSend={handleUserSubmit} />)}

            {/* Scrollable message list */}
            <div className="flex flex-col overflow-y-auto px-4 pt-[150px] pb-[300px] w-full hide-scrollbar mask-fade-bottom">
                {conversation?.msgList?.map((msg) =>
                    msg.role === "user" ? (
                        <UserMessage
                            key={msg.msgId}
                            message={msg.content}
                            token={msg.token}
                            historyTokens={msg.historyTokens}
                            onEdit={(newContent: string | null) => handleMessageEdit(newContent, msg.msgId)}
                        />
                    ) : (
                        <BotMessage
                            key={msg.msgId}
                            message={msg.content}
                            token={msg.token}
                            think={msg.thinkContent ?? undefined}
                            onReload={() => handleBotMessageReload(msg.msgId)}
                        />
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-red-400 bg-red-950/30 backdrop-blur-sm border-2 border-red-400/20 rounded-md px-10 py-5 text-sm shadow-md z-[51] max-w-[80%] text-center" ref={errorRef}>
                    {error}
                </div>
            )}

            {/* Fixed input bar */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 z-20 bg-gradient-to-t from-[#12141b] to-transparent shadow-xl">
                <Input onSend={handleUserSubmit} />
            </div>
        </div>

    );
};

export default ChatPage;