import { useRef, useEffect } from "react";
import Input from "../components/input/input";
import { UserMessage } from "../components/message/userMessage";
import { BotMessage } from "../components/message/botMessage";
import { useConv } from "../hooks/useConv";
import { useUser } from "../hooks/useUser";
import { createConversation, sendMessage, updateMessage } from "../api";
import type { Message } from "../contexts/convContext";
import type { ConversationItem } from "../components/sidebar/sideBar";
import ModalInput from "../components/modalInput";
import { stripThinkTags } from "../utils";

const ChatPage: React.FC = () => {
    const { conversation, setConversation, modalOpen, setModalOpen, selectedModel } = useConv();
    const { setUserData } = useUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

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


    const appendToConversation = (...messages: Message[]) => {
        setConversation((prev) => {
            if (prev && prev.convId === messages[0].convId) {
                return {
                    ...prev,
                    date: messages[messages.length - 1].timestamp,
                    msgList: [...(prev.msgList || []), ...messages],
                };
            } else {
                return {
                    convId: messages[0].convId ?? null,
                    convName: messages[0].convName ?? null,
                    date: messages[messages.length - 1].timestamp,
                    msgList: [...messages],
                };
            }
        });
    };

    const appendUserAndBotMessages = (userMsg: Message, botMsg: Message) => {
        console.log("Appending messages:", userMsg, botMsg);
        appendToConversation(userMsg, botMsg);
    };

    const appendBotMessage = (ansMessage: Message) => {
        appendToConversation(ansMessage);
    };


    const updateLastBotMessage = (updater: (msg: Message) => Message) => {
        setConversation((prev) => {
            if (!prev || !prev.msgList) return prev;
            const updated = [...prev.msgList];
            const last = updated[updated.length - 1];

            if (last && last.role === "assistant") {
                updated[updated.length - 1] = updater(last);
                return { ...prev, msgList: updated };
            }
            return prev;
        });
    };

    const appendToBotContent = (chunk: string) => {
        updateLastBotMessage((msg) => ({
            ...msg,
            content: (msg.content || "") + chunk,
        }));
    };

    const updateBotThinkingContent = (thinkChunk: string) => {
        updateLastBotMessage((msg) => ({
            ...msg,
            thinkContent: thinkChunk,
        }));
    };

    const createConvHandler = (conv: ConversationItem) => {
        setConversation({ ...conv, msgList: [] });
        setUserData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: [...(prev.conversations || []), conv],
            };
        });
    };

    const appendToConversationTitle = (convId: string, token: string) => {
        setConversation((prev) => {
            if (!prev || prev.convId !== convId) return prev;
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


    const handleTitleTokenStream = (token: string, convId: string | null) => {
        if (!convId) return;
        appendToConversationTitle(convId, token);
    };


    const updateTokenCount = (promptToken: number, responseToken: number) => {
        // Should update the last two message in conversation
        setConversation((prev) => {
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

    const ensureConversationReady = async (message: string): Promise<string | null> => {
        if (conversation?.convId) return conversation.convId;

        const convId = await createConversation(message, selectedModel, createConvHandler, handleTitleTokenStream);
        console.log("New conversation created with ID:", convId);

        setTimeout(() => setModalOpen(false), 3000);
        return convId;
    };

    const sendMessageToAPI = async (convId: string, message: string) => {
        await sendMessage(convId, message, selectedModel, appendUserAndBotMessages, appendToBotContent, updateTokenCount, updateBotThinkingContent);
    };



    const handleUserSubmit = async (message: string) => {
        const convId = await ensureConversationReady(message);
        if (!convId) return;
        await sendMessageToAPI(convId, message);
    };

    const keepMessagesUpTo = (msgId: string) => {
        setConversation((prev) => {
            if (!prev || !prev.msgList) return prev;
            const msgIndex = prev.msgList.findIndex(msg => msg.msgId === msgId);
            if (msgIndex === -1) return prev;

            return {
                ...prev,
                msgList: prev.msgList.slice(0, msgIndex + 1),
            };
        });
    };

    const handleMessageEdit = async (newContent: string | null, msgId: string | null) => {
        const content = newContent?.trim();
        if (!content) {
            console.warn("Empty message, not sending.");
            return;
        }

        if (!msgId) {
            await handleUserSubmit(content);
            return;
        }

        const convId = conversation?.convId;
        if (!convId) return;

        keepMessagesUpTo(msgId);
        await updateMessage(convId, msgId, content, selectedModel, appendBotMessage, appendToBotContent, updateTokenCount, updateBotThinkingContent);
    };


    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-t from-[#12141b] to-[#191c2a]">
            <div className="relative h-16 flex justify-center items-center">
                <h1 className="text-3xl font-medium text-white font-playfair">
                    {conversation ? stripThinkTags(conversation.convName || "") : "Hello, ask me anything!"}
                </h1>
                {conversation && (
                    <span className="absolute right-6 top-4 text-sm text-gray-400 font-normal">
                        {
                            // Sum of the tokens of the messages in the conversation
                            conversation.msgList?.reduce((acc, msg) => acc + (msg.token || 0), 0)
                        } tokens used
                    </span>
                )}
            </div>
            <ModalInput open={modalOpen} onClose={() => { setModalOpen(false) }} onSend={handleUserSubmit} />
            <div className="flex flex-col overflow-y-auto p-4 h-full w-full hide-scrollbar scroll-smooth">
                {conversation?.msgList?.map((msg) =>
                    msg.role === "user" ? (
                        <UserMessage key={msg.msgId} message={msg.content} token={msg.token} onEdit={(newContent: string | null) => { handleMessageEdit(newContent, msg.msgId) }} />
                    ) : (
                        <BotMessage key={msg.msgId} message={msg.content} token={msg.token} think={msg.thinkContent ?? undefined} onReload={() => { }} />
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center justify-between p-4 shadow-custom">
                <Input onSend={handleUserSubmit} />
            </div>
        </div>
    );
};

export default ChatPage;