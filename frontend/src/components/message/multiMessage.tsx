import type { multiMessage } from '../../api/types';
import { UserMessage } from './userMessage';
import { useConversationLogic } from '../../hooks/useConversationLogic';
import { BotMessageV2 } from './botMessage_v2';


interface MultiMessageProps {
    multiMessage: multiMessage;
    isLast: boolean;
}

export function MultiMessage({ multiMessage, isLast }: MultiMessageProps) {
    const { mergeMessages, editMessage } = useConversationLogic();

    if (multiMessage.messages.length === 0) return null;

    if (multiMessage.messages.length === 1) return (
        multiMessage.messages[0].role === 'user' ? (
            <UserMessage
                key={multiMessage.messages[0].msgId}
                message={multiMessage.messages[0].content}
                token={multiMessage.messages[0].token}
                historyTokens={multiMessage.messages[0].historyToken}
                onEdit={(newMessage: string) => { editMessage(newMessage, multiMessage.messages[0].msgId) }}
            />
        ) : (
            <BotMessageV2 splittedMessage={multiMessage.messages[0]} />
        )
    );

    const getGridClass = (count: number) => {
        switch (count) {
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <div className="flex flex-col w-full justify-center items-center gap-4">
            <div className={`grid ${getGridClass(multiMessage.messages.length)} gap-4 w-full items-stretch`}>
                {multiMessage.messages.map((message) => (
                    <BotMessageV2 splittedMessage={message} isMulti={true} key={message.msgId} isLast={isLast} />
                ))}
            </div>

            {/* Merge button */}
            {isLast && multiMessage.messages.length > 1 && (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                        const parentIds = multiMessage.messages.map(msg => msg.msgId);
                        mergeMessages(parentIds);
                    }}
                >
                    Merge Answers
                </button>
            )}
        </div>
    );
}