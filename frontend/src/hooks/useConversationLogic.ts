import { useConversation } from "./useConversation";
import type { splittedMessage, Node, linearConversation } from "../api/types";
import { getConversation } from "../api/conversation";
import { splitThinkContent } from "../utils";

export function useConversationLogic() {
    const { conversation, setConversation, graph, setGraph } = useConversation();

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




    return {
        conversation,
        graph,
        getLinearizedGraph,
        openConversation
    }
}