import { useConversation } from "./useConversation";
import { type Conversation, defaultConversation, type splittedMessage, type Node, type linearConversation, type Message, type Graph, defaultGraph } from "../api/types";
import { getConversation, addConversation as addConversationAPI, deleteConversation as deleteConversationAPI } from "../api/conversation";
import { replyToMessage as replyToMessageAPI, mergeMessages as mergeMessagesAPI, regenerateMessage as regenerateMessageAPI, chooseReply as chooseReplyAPI, editMessage as editMessageAPI } from "../api/message";
import { splitThinkContent } from "../utils";
import { useUser } from "./useUser";

export function useConversationLogic() {
    const { conversation, setConversation, graph, setGraph } = useConversation();
    const { convList, setConvList, selectedModel } = useUser();

    const groupedConversations = (): Record<string, Conversation[]> => {
        // Group conversations by Today, Yesterday, Last 7 days, Preceding conversations

        const now = new Date();
        const todayStr = now.toDateString();
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

        const groups = {
            Today: [] as Conversation[],
            Yesterday: [] as Conversation[],
            Last7: [] as Conversation[],
            Preceding: [] as Conversation[],
        };

        for (const conv of convList) {
            const convDate = new Date(conv.date);
            const convStr = convDate.toDateString();
            if (convStr === todayStr) groups.Today.push(conv);
            else if (convStr === yesterdayStr) groups.Yesterday.push(conv);
            else if (convDate > sevenDaysAgo) groups.Last7.push(conv);
            else groups.Preceding.push(conv);
        }
        Object.values(groups).forEach(list =>
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        return groups;
    }

    const openConversation = async (convId: string) => {
        const { graph, conversation } = await getConversation(convId);
        setGraph(graph);
        setConversation(conversation);
    }

    const getLinearizedGraph = (): linearConversation => {
        const linearized: { node: Node, level: number }[] = [];
        const seen = new Set<string>();

        const root = graph.messagesMap[graph.rootId[0]];
        if (!root) return [];

        const queue = [{ node: root, level: 0 }];
        let index = 0;
        while (index < queue.length) {
            const { node, level } = queue[index];
            index++;

            if (seen.has(node.message.msgId)) continue;
            seen.add(node.message.msgId);

            linearized.push({ node, level });
            for (const childId of node.children) {
                const childNode = graph.messagesMap[childId];
                if (childNode) {
                    queue.push({ node: childNode, level: level + 1 });
                }
            }
        }
        const lastLevel = linearized[linearized.length - 1].level;
        // So we can init the result as an array of size lastLevel+1

        const result: linearConversation = Array.from({ length: lastLevel + 1 }, () => ({
            role: 'assistant',
            messages: [] as splittedMessage[]
        }));

        linearized.forEach(({ node, level }) => {
            const numParents = node.parents.length;
            const role = numParents > 1
                ? 'merger'
                : node.message.role as 'user' | 'assistant';

            result[level].role = role;

            const { mainContent, thinkContent } = splitThinkContent(node.message.content);
            result[level].messages.push({
                ...node.message,
                thinkContent,
                mainContent
            });
            result[level].messages.sort((a, b) => a.author.localeCompare(b.author));
        })
        return result;
    }

    const addMessageToGraph = (message: Message, parentId: string[]): void => {
        if (parentId.length === 0) {
            // New conv:
            const newGraph: Graph = {
                rootId: [message.msgId],
                messagesMap: {
                    [message.msgId]: {
                        message,
                        parents: [],
                        children: []
                    }
                }
            };
            setGraph(newGraph);
            return;
        }
        // Find the parent id and add the new message as a child
        setGraph((prevGraph) => {
            const newMessagesMap = { ...prevGraph.messagesMap };

            for (const parent of parentId) {
                const parentNode = newMessagesMap[parent];
                if (parentNode) {
                    newMessagesMap[parent] = {
                        ...parentNode,
                        children: [...parentNode.children, message.msgId] // <- pas de mutation
                    };
                }
            }

            newMessagesMap[message.msgId] = {
                message,
                parents: parentId,
                children: []
            };

            return {
                ...prevGraph,
                messagesMap: newMessagesMap
            };
        });

    }

    const removeChildrenFromGraph = (msgId: string): void => {
        setGraph((prevGraph) => {

            const newMessagesMap = { ...prevGraph.messagesMap };
            if (!prevGraph.messagesMap[msgId]) {
                console.warn(`Message with ID ${msgId} not found in graph.`);
                return prevGraph;
            }

            const toDelete: string[] = newMessagesMap[msgId].children;
            newMessagesMap[msgId].children = [];
            const deleted = new Set();
            while (toDelete.length > 0) {
                const curId = toDelete.pop();
                if (curId === undefined) continue;
                const curNode = prevGraph.messagesMap[curId];
                if (curNode && !deleted.has(curId)) {
                    toDelete.push(...curNode.children);
                    // Delete the current node
                    delete newMessagesMap[curId];
                    deleted.add(curId);
                }
            }

            // Return the updated graph without the deleted messages
            return {
                ...prevGraph,
                messagesMap: newMessagesMap
            };
        });
    }

    const removeMessageAndChildrenFromGraph = (msgId: string): void => {
        removeChildrenFromGraph(msgId);
        setGraph((prevGraph) => {
            const newMessagesMap = { ...prevGraph.messagesMap };
            const newRootId = prevGraph.rootId.filter(id => id !== msgId);
            for (const parentId of newMessagesMap[msgId].parents) {
                newMessagesMap[parentId].children = newMessagesMap[parentId].children.filter(childId => childId !== msgId);
            }
            delete newMessagesMap[msgId];
            return {
                messagesMap: newMessagesMap,
                rootId: newRootId
            };
        })
    }

    const addTokenToGraph = (model: string, token: string, replyContainer: Record<string, Message>) => {
        const targetId = replyContainer[model].msgId;
        setGraph((prevGraph) => {
            const newMessagesMap = { ...prevGraph.messagesMap };
            const targetNode = newMessagesMap[targetId];

            if (targetNode) {
                // Append the token to the existing content
                const updatedMessage: Message = {
                    ...targetNode.message,
                    content: targetNode.message.content + token
                };

                newMessagesMap[targetId] = {
                    ...targetNode,
                    message: updatedMessage
                };
            }
            return {
                ...prevGraph,
                messagesMap: newMessagesMap
            };
        });
    }

    const setTokenForMessage = (msgId: string, token: number, historyToken: number): void => {
        setGraph((prevGraph) => {
            const newMessagesMap = { ...prevGraph.messagesMap };
            if (newMessagesMap[msgId]) {
                newMessagesMap[msgId].message.token = token;
                newMessagesMap[msgId].message.historyToken = historyToken;
            }
            return {
                ...prevGraph,
                messagesMap: newMessagesMap
            };
        });
    }

    const addConversation = async (firstMessage: string): Promise<void> => {

        await addConversationAPI(
            firstMessage,
            selectedModel,
            (conv: Conversation) => {
                setConversation(conv);
                setConvList((prevList) => [...prevList, conv]);
            },
            (message: Message) => {
                addMessageToGraph(message, []);
            },
            (replyContainer: Record<string, Message>, firstMessageId: string) => {
                for (const modelName in replyContainer) {
                    const message = replyContainer[modelName];
                    addMessageToGraph(message, [firstMessageId]);
                }
            },
            addTokenToGraph,
            (replies: Record<string, Message>) => {
                for (const modelName in replies) {
                    setTokenForMessage(replies[modelName].msgId, replies[modelName].token, replies[modelName].historyToken);
                }
            }
        );
    }

    const deleteConversation = (convId: string): void => {
        deleteConversationAPI(convId);
        setConvList((prevList) => prevList.filter(conv => conv.convId !== convId));
        if (conversation.convId === convId) resetConversation();
    }

    const replyToMessage = async (userMessage: string, parentId: string[]): Promise<void> => {

        if (parentId.length === 0) {
            // set last messages as parents or create a new conversation if zero messages:
            const linearized = getLinearizedGraph();
            if (linearized.length === 0) {
                addConversation(userMessage);
                return;
            }
            const lastLevelMessages = linearized[linearized.length - 1].messages as splittedMessage[];
            parentId = lastLevelMessages.map(msg => msg.msgId);
        }

        await replyToMessageAPI(
            conversation.convId,
            userMessage,
            selectedModel,
            parentId,
            (message: Message) => {
                addMessageToGraph(message, parentId);
            },
            (replyContainer: Record<string, Message>, firstMessageId: string) => {
                for (const modelName in replyContainer) {
                    const message = replyContainer[modelName];
                    addMessageToGraph(message, [firstMessageId]);
                }
            },
            addTokenToGraph,
            (replies: Record<string, Message>) => {
                for (const modelName in replies) {
                    setTokenForMessage(replies[modelName].msgId, replies[modelName].token, replies[modelName].historyToken);
                }
            }
        )

    }

    const editMessage = async (newContent: string, msgId: string): Promise<void> => {
        console.log("Editing message", msgId, "with content:", newContent);
        await editMessageAPI(
            conversation.convId,
            newContent,
            msgId,
            selectedModel,
            (replyContainer: Record<string, Message>, firstMessageId: string) => {
                // We can assume that at this point there will be no error an we can safely edit the userMessage in the UI...
                const newGraph = { ...graph };
                newGraph.messagesMap[msgId].message.content = newContent;
                setGraph(newGraph);

                // ... and delete the other children of the edited message
                removeChildrenFromGraph(msgId);

                // ... and add the replyContainer messages
                for (const modelName in replyContainer) {
                    const message = replyContainer[modelName];
                    addMessageToGraph(message, [firstMessageId]);
                }

            },
            addTokenToGraph,
            (replies: Record<string, Message>) => {
                for (const modelName in replies) {
                    setTokenForMessage(replies[modelName].msgId, replies[modelName].token, replies[modelName].historyToken);
                }
            }
        )
    }

    const mergeMessages = async (parentId: string[]): Promise<void> => {
        if (parentId.length < 2) {
            console.warn('Merge requires at least two parent messages');
            return;
        }
        const modelName = selectedModel[0];

        await mergeMessagesAPI(
            conversation.convId,
            modelName,
            parentId,
            (message: Message) => {
                addMessageToGraph(message, parentId);
            },
            (token: string, mergeContainer: Message) => {
                addTokenToGraph(modelName, token, { [modelName]: mergeContainer });
            },
            (merge: Message) => {
                setTokenForMessage(merge.msgId, merge.token, merge.historyToken);
            }

        )
    }

    const regenerateMessage = async (convId: string, msgId: string, modelName: string): Promise<void> => {
        await regenerateMessageAPI(
            convId,
            msgId,
            modelName,
            (replyContainer: Message) => {
                const parents = graph.messagesMap[msgId].parents;
                addMessageToGraph(replyContainer, parents);
                removeMessageAndChildrenFromGraph(msgId);
            },
            addTokenToGraph,
            (replies: Message) => {
                setTokenForMessage(replies.msgId, replies.token, replies.historyToken);
            }
        )
    }

    const chooseReply = async (convId: string, msgId: string) => {
        await chooseReplyAPI(convId, msgId)
        // Delete other message in the same multiMessage
        for (const parentId of graph.messagesMap[msgId].parents) {
            const parentNode = graph.messagesMap[parentId];
            for (const childId of parentNode.children) {
                if (childId !== msgId) removeMessageAndChildrenFromGraph(childId)
            };
        }
    }

    const resetConversation = () => {
        setConversation(defaultConversation);
        setGraph(defaultGraph);
    }


    return {
        conversation,
        graph,
        getLinearizedGraph,
        addConversation,
        openConversation,
        replyToMessage,
        editMessage,
        mergeMessages,
        regenerateMessage,
        chooseReply,
        groupedConversations,
        deleteConversation,
        resetConversation
    }
}