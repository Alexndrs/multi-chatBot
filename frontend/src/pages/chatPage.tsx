import { useRef, useEffect, useState } from "react";
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
    const errorRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

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

    const appendUserMessage = (userMsg: Message) => {
        appendToConversation(userMsg);
    };

    const removeLastBotMessage = (msgId: string | null) => {
        if (!msgId) return;

        setConversation((prev) => {
            console.log("Removing last bot message:", msgId);
            if (!prev || !prev.msgList) return prev;
            const updated = prev.msgList.filter(msg => msg.msgId !== msgId);
            return { ...prev, msgList: updated };
        });
    };




    const appendBotMessage = (ansMessage: Message): string | null => {
        console.log("Appending bot message:", ansMessage);
        appendToConversation(ansMessage);
        return ansMessage.msgId || null;

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

    const createConvHandler = (conv: ConversationItem): ConversationItem => {
        setConversation({ ...conv, msgList: [] });
        setUserData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: [...(prev.conversations || []), conv],
            };
        });

        return conv;
    };

    const removeConversationFromUserData = (convId: string) => {
        setUserData((prev) => {
            if (!prev || !prev.conversations) return prev;
            const updated = prev.conversations.filter(c => c.convId !== convId);
            return { ...prev, conversations: updated };
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

    const updateTokenCount = (currentMessageTokens: number, historyTokens: number, responseToken: number) => {
        // Should update the last two message in conversation
        setConversation((prev) => {
            if (!prev || !prev.msgList) return prev;
            const updated = [...prev.msgList];
            const userMsg = updated[updated.length - 2];
            const assistantMsg = updated[updated.length - 1];

            if (userMsg && userMsg.role === "user") {
                updated[updated.length - 2] = {
                    ...userMsg,
                    token: currentMessageTokens,
                    historyTokens: historyTokens,
                };
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

        let newConv: ConversationItem | null = null;

        try {
            const convId = await createConversation(
                message,
                selectedModel,
                (conv) => {
                    newConv = createConvHandler(conv);
                    return newConv;
                },
                handleTitleTokenStream
            );
            setTimeout(() => setModalOpen(false), 1500);
            return convId;
        } catch (err: unknown) {
            console.error("Error creating conversation:", err);
            setModalOpen(false);

            if ((newConv as ConversationItem | null)?.convId) {
                console.warn("Removing failed conv from UI", ((newConv as unknown) as ConversationItem).convId);
                removeConversationFromUserData(((newConv as unknown) as ConversationItem).convId);
            }

            if (err instanceof Error) {
                setError(err.message || "Une erreur est survenue.");
                throw new Error("Failed to create conversation : " + err.message)
            } else {
                setError("Une erreur est survenue.");
            }
            return null;
        }
    };


    const sendMessageToAPI = async (convId: string, message: string) => {
        let botMsgId: string | null = null;

        try {
            await sendMessage(
                convId,
                message,
                selectedModel,
                (userMsg, botMsg) => {
                    appendUserMessage(userMsg);
                    botMsgId = appendBotMessage(botMsg);
                },
                appendToBotContent,
                updateTokenCount,
                updateBotThinkingContent
            );
        } catch (err: unknown) {
            console.error("Error in sendMessageToAPI:", err);
            removeLastBotMessage(botMsgId); // << On passe l'id manuellement
            if (err instanceof Error) {
                setError(err.message || "Une erreur est survenue.");
            } else {
                setError("Une erreur est survenue.");
            }
        }
    };



    const handleUserSubmit = async (message: string) => {
        setError(null); // Reset any previous error

        try {
            const convId = await ensureConversationReady(message);
            if (!convId) throw new Error("Failed to create conversation.");
            await sendMessageToAPI(convId, message);
        } catch (err: unknown) {
            console.error("Error sending message:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue.");
            }
        }

    };

    const keepMessagesUpTo = (msgId: string, editedMessageContent?: string | null) => {
        setConversation((prev) => {
            if (!prev || !prev.msgList) return prev;
            const msgIndex = prev.msgList.findIndex(msg => msg.msgId === msgId);
            if (msgIndex === -1) return prev;

            const updated = [...prev.msgList];
            updated[msgIndex] = {
                ...updated[msgIndex],
                content: editedMessageContent || updated[msgIndex].content,
            };
            const slicedMessage = updated.slice(0, msgIndex + 1);

            return {
                ...prev,
                msgList: slicedMessage
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



        keepMessagesUpTo(msgId, newContent);
        await updateMessage(convId, msgId, content, selectedModel, appendBotMessage, appendToBotContent, updateTokenCount, updateBotThinkingContent);
    };

    const handleBotMessageReload = async (botMsgId: string | null) => {
        if (!conversation?.msgList || !conversation.convId || !botMsgId) return;

        const msgs = conversation.msgList;
        const botIdx = msgs.findIndex(msg => msg.msgId === botMsgId);
        if (botIdx <= 0 || msgs[botIdx].role !== "assistant") return;

        const userMsg = msgs[botIdx - 1];
        if (!userMsg || userMsg.role !== "user") return;

        // Garde les messages jusqu’à userMsg
        if (!userMsg.msgId || !userMsg.content) return;

        keepMessagesUpTo(userMsg.msgId);

        // Relance le pipeline comme une édition, mais avec le même contenu
        await updateMessage(
            conversation.convId,
            userMsg.msgId,
            userMsg.content,
            selectedModel,
            appendBotMessage,
            appendToBotContent,
            updateTokenCount,
            updateBotThinkingContent
        );
    };

    return (
        <div className="relative flex flex-col overflow-hidden h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a]">

            {/* Header */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full py-5 flex justify-center items-center z-20 backdrop-blur-md">
                <h1 className="text-3xl font-medium text-white font-playfair">
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