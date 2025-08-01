import { useConversation } from "./useConversation";
import { type splittedMessage, type Node, type linearConversation, type Message, type Graph } from "../api/types";
import { getConversation, addConversation as addConversationAPI } from "../api/conversation";
import { splitThinkContent } from "../utils";
import { useUser } from "./useUser";

export function useConversationLogic() {
    const { conversation, setConversation, graph, setGraph } = useConversation();
    const { selectedModel } = useUser();

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

    const addTokenToGraph = (model: string, token: string, replyContainer: Record<string, Message>) => {
        // console.log(`Adding token for model ${model}:`, token);
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
            } else {
                console.warn(`Target message with ID ${targetId} not found in graph.`);
            }

            return {
                ...prevGraph,
                messagesMap: newMessagesMap
            };
        });
    }


    const addConversation = (firstMessage: string) => {

        addConversationAPI(
            firstMessage,
            selectedModel,
            setConversation,
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
            () => {
                // Final replies received callback (no parameters needed)
            }
        );
    }


    return {
        conversation,
        graph,
        getLinearizedGraph,
        openConversation,
        addConversation
    }
}