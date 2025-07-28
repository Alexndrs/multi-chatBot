import { useConv } from "./useConv";
import type { Message } from "../contexts/convContext";
import { useUser } from "./useUser";
import { createConversation, sendMessage, updateMessage } from "../api";
import type { ConversationItem } from "../components/sidebar/sideBar";

export function useChatLogic() {
    const { conversation, setConversation, selectedModel, setModalOpen } = useConv();
    const { setUserData } = useUser();

    // ────────────── Low level : context setters ──────────────


    /**
     * append a token to the conversation title in the UI and user data
     * @param convId 
     * @param token 
     */
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

    /**
     * update the last bot message in the conversation
     * @param updater 
     */
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

    /**
     * append messages to the conversation
     * @param messages 
     */
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

    /**
     * remove a conversation from user data
     * @param convId 
     */
    const removeConversationFromUserData = (convId: string) => {
        setUserData((prev) => {
            if (!prev || !prev.conversations) return prev;
            const updated = prev.conversations.filter(c => c.convId !== convId);
            return { ...prev, conversations: updated };
        });
    };

    /**
     * keep messages up to a certain message ID (useful for creating a new branch in the conversation)
     * @param msgId 
     * @param editedMessageContent 
     */
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

    /**
     * Remove the last bot message from the conversation
     * @param msgId 
     */
    const removeLastBotMessage = (msgId: string | null) => {
        if (!msgId) return;

        setConversation((prev) => {
            console.log("Removing last bot message:", msgId);
            if (!prev || !prev.msgList) return prev;
            const updated = prev.msgList.filter(msg => msg.msgId !== msgId);
            return { ...prev, msgList: updated };
        });
    };

    /**
     * Update the token count of the last two messages in the conversation
     * @param currentMessageTokens 
     * @param historyTokens 
     * @param responseToken 
     */
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


    // ────────────── Mid level : helpers ──────────────

    /**
     * Append a chunk to the last bot message content
     * @param chunk 
     */
    const appendToBotContent = (chunk: string) => {
        updateLastBotMessage((msg) => ({
            ...msg,
            content: (msg.content || "") + chunk,
        }));
    };

    /**
     * Update the bot thinking content with a new chunk
     * @param thinkChunk 
     */
    const updateBotThinkingContent = (thinkChunk: string) => {
        updateLastBotMessage((msg) => ({
            ...msg,
            thinkContent: thinkChunk,
        }));
    };

    /**
     * Create a new conversation and set it in the UI
     * @param conv 
     * @returns 
     */
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

    /**
     * Make sure the conversation is ready and add streamed token to the title
     * @param token 
     * @param convId 
     */
    const handleTitleTokenStream = (token: string, convId: string | null) => {
        if (!convId) return;
        appendToConversationTitle(convId, token);
    };

    /**
     * Send a user message and append it to the conversation
     * @param userMsg 
     */
    const appendUserMessage = (userMsg: Message) => {
        appendToConversation(userMsg);
    };

    /**
     * Append a bot message to the conversation
     * @param ansMessage 
     * @returns 
     */
    const appendBotMessage = (ansMessage: Message): string | null => {
        console.log("Appending bot message:", ansMessage);
        appendToConversation(ansMessage);
        return ansMessage.msgId || null;
    };


    // ────────────── High level : API calls ──────────────

    /**
     * Ensure the conversation is ready (either existing or created)
     * @param message 
     * @returns 
     */
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
                throw new Error("Failed to create conversation : " + err.message)
            } else {
                throw new Error("An error appended while creating the conversation");
            }
        }
    };

    /**
     * Send a message to the API and handle the response
     * @param convId 
     * @param message 
     */
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
                throw new Error("Failed to send message: " + err.message);
            } else {
                throw new Error("An error appended while sending the message.");
            }
        }
    };


    // ────────────── Public API ──────────────

    /**
     * ensure the conversation is ready (creates a new one if needed) and send a user message
     * @param message 
     */
    const sendUserMessage = async (message: string) => {
        const convId = await ensureConversationReady(message);
        if (!convId) throw new Error("Failed to create conversation.");
        await sendMessageToAPI(convId, message);
    }

    /**
     * Edit a message in the conversation
     * @param newContent 
     * @param msgId 
     */
    const editMessage = async (newContent: string, msgId: string) => {
        const convId = conversation?.convId;
        if (!convId) return;

        keepMessagesUpTo(msgId, newContent);
        await updateMessage(convId, msgId, newContent, selectedModel, appendBotMessage, appendToBotContent, updateTokenCount, updateBotThinkingContent);
    }

    /**
     * Reload a bot message by re-sending the user message that precedes it
     * @param botMsgId 
     */
    const reloadBotMessage = async (botMsgId: string | null) => {
        if (!conversation?.msgList || !conversation.convId || !botMsgId) throw new Error("Invalid conversation or bot message ID.");

        const msgs = conversation.msgList;
        const botIdx = msgs.findIndex(msg => msg.msgId === botMsgId);
        if (botIdx <= 0 || msgs[botIdx].role !== "assistant") throw new Error("Invalid bot message ID.");

        const userMsg = msgs[botIdx - 1];
        if (!userMsg || userMsg.role !== "user") throw new Error("Invalid user message before bot message.");

        // Garde les messages jusqu’à userMsg
        if (!userMsg.msgId || !userMsg.content) throw new Error("User message must have a valid ID and content.");

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

    }

    return {
        sendUserMessage,
        editMessage,
        reloadBotMessage
    };
}
