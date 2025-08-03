import type { multiMessage, splittedMessage } from '../../api/types';
import { UserMessage } from './userMessage';
import { useConversationLogic } from '../../hooks/useConversationLogic';
import { BotMessageV2 } from './botMessage_v2';


const tmpBotMessage = (splittedMessage: splittedMessage) => {

    return (
        <div key={splittedMessage.msgId} className="flex flex-col text-sm p-4 gap-2 bg-white/5 rounded-lg">
            <div className="font-semibold pb-2 border-b border-white/5">{splittedMessage.author}</div>
            <div className={'text-white whitespace-pre-wrap flex-1}'}>
                {splittedMessage.thinkContent && (
                    <div className="text-blue-300 mb-2">
                        {splittedMessage.thinkContent}
                    </div>
                )}
                <div>
                    {splittedMessage.mainContent}
                </div>
            </div>
        </div>
    );
};

interface MultiMessageProps {
    multiMessage: multiMessage;
    isLast: boolean;
}

export function MultiMessage({ multiMessage, isLast }: MultiMessageProps) {
    const { mergeMessages } = useConversationLogic();

    if (multiMessage.messages.length === 0) return null;

    if (multiMessage.messages.length === 1) return (
        multiMessage.messages[0].role === 'user' ? (
            <UserMessage
                key={multiMessage.messages[0].msgId}
                message={multiMessage.messages[0].content}
                token={multiMessage.messages[0].token}
                historyTokens={multiMessage.messages[0].historyToken}
                onEdit={() => { }}
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
                    <BotMessageV2 splittedMessage={message} isMulti={true} key={message.msgId} />
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