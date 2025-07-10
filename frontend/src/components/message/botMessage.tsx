import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../codeBlock';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';


const ThinkingPlaceholder = () => (
    <span className="font-semibold relative inline-block shimmer-text text-transparent bg-clip-text italic">Please wait, I'm thinking...</span>
);


type CodeComponentProps = ComponentPropsWithoutRef<'code'> & {
    inline?: boolean;
};

export function BotMessage({
    message,
    onReload,
    token,
    think }: {
        message: string | null;
        onReload: () => void;
        token: number,
        think?: string
    }) {

    const [showThinking, setShowThinking] = useState(false);
    const [isLoading, setIsLoading] = useState(message === null || message.trim() === "");


    useEffect(() => {
        if (message && message.trim() !== "") {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [message]);


    return (

        <div className="self-start ml-0 md:ml-15 mt-5 w-fit max-w-[90%]">
            {think && (
                <div className="mb-2 text-xs text-gray-100">
                    <button
                        className="flex items-center gap-1 hover:cursor-pointer focus:outline-none"
                        onClick={() => setShowThinking(!showThinking)}
                    >
                        <span
                            className={`font-semibold relative inline-block ${isLoading ? 'shimmer-text text-transparent bg-clip-text' : ''
                                }`}
                        >
                            {isLoading ? 'Thinking...' : 'Thinking'}
                        </span>
                        <FontAwesomeIcon icon={showThinking ? faChevronUp : faChevronDown} size="xs" />
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${showThinking ? 'opacity-100 mt-1' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="p-2 rounded-md bg-blue-900/20 text-blue-300 text-sm whitespace-pre-wrap font-mono">
                            {think}
                        </div>
                    </div>
                </div>
            )}
            <div className="prose prose-invert max-w-none text-gray-300 text-sm p-4">
                {!isLoading ? (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ className, children, inline }: CodeComponentProps) {

                                const match = /language-(\w+)/.exec(className || '');
                                const codeContent = String(children).replace(/\n$/, '');

                                if (!inline && match) {
                                    return <CodeBlock language={match[1]} value={codeContent} />;
                                }

                                return <code className="bg-gray-800 px-1 rounded">{children}</code>;
                            },
                        }}

                    >
                        {message}
                    </ReactMarkdown>
                ) : (
                    // If the message already has think content we don't need to say it again
                    think ? null : <ThinkingPlaceholder />
                )}
            </div>

            <div className="border-t-2 border-gray-800 mb-2 w-full" />

            {token > 0 ? (
                <div className="flex justify-between items-center text-[10px] text-gray-500 italic w-full px-1">

                    <span>{token} tokens</span>
                    <button onClick={onReload} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            ) : (
                <div className="flex justify-end items-center text-[10px] text-gray-500 italic w-full px-1">
                    <button onClick={onReload} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            )
            }
        </div>
    );
}