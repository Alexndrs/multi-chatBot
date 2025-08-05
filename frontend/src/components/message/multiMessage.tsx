import type { multiMessage } from '../../api/types';
import { UserMessage } from './userMessage';
import { useConversationLogic } from '../../hooks/useConversationLogic';
import { BotMessage } from './botMessage';


interface MultiMessageProps {
    multiMessage: multiMessage;
    isLast: boolean;
    setError: (error: string | null) => void;
}

export function MultiMessage({ multiMessage, isLast, setError }: MultiMessageProps) {
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
            <BotMessage splittedMessage={multiMessage.messages[0]} />
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

    const handleMerge = async () => {
        try {
            const parentIds = multiMessage.messages.map(msg => msg.msgId);
            await mergeMessages(parentIds);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    }

    const allMessagesAreNotEmpty = multiMessage.messages.every(msg => msg.content.trim() !== '');

    return (
        <div className="flex flex-col w-full justify-center items-center gap-4">
            <div className={`grid ${getGridClass(multiMessage.messages.length)} gap-4 w-full items-stretch`}>
                {multiMessage.messages.map((message) => (
                    <BotMessage splittedMessage={message} isMulti={true} key={message.msgId} isLast={isLast} setError={setError} />
                ))}
            </div>

            {/* Merge button */}
            {isLast && multiMessage.messages.length > 1 && allMessagesAreNotEmpty && (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 cursor-pointer transition-colors duration-200"
                    onClick={handleMerge}
                >
                    Merge Answers
                </button>
            )}
        </div>
    );
}