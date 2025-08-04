import type { splittedMessage } from "../../api/types";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../codeBlock';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { ComponentPropsWithoutRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useConversationLogic } from '../../hooks/useConversationLogic';

type CodeComponentProps = ComponentPropsWithoutRef<'code'> & {
    inline?: boolean;
};


export function BotMessageV2({ splittedMessage, isMulti, isLast }: { splittedMessage: splittedMessage, isMulti?: boolean, isLast?: boolean }) {

    const [showThinking, setShowThinking] = useState(false);
    const { regenerateMessage, chooseReply } = useConversationLogic();


    return (
        <div key={splittedMessage.msgId} className={`flex flex-col py-4 gap-2 ${isMulti ? 'bg-white/1 rounded-lg px-8' : 'px-4 md:px-40'}`}>
            {isMulti && <h2 className="pb-2 border-b border-[var(--color-separator)] text-center">{splittedMessage.author}</h2>}
            <div className={'pb-2 whitespace-pre-wrap flex-1}'}>
                {splittedMessage.thinkContent && (<button className="bg-white/5 px-4 py-2 my-5 rounded-lg" onClick={() => setShowThinking(!showThinking)}>{
                    showThinking ? <FontAwesomeIcon icon={faChevronUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDown} size="sm" />
                } Thinking</button>)}
                {showThinking && splittedMessage.thinkContent && (
                    <div className="text-blue-300 mb-2 thinkingText">
                        {splittedMessage.thinkContent}
                    </div>
                )}
                <div className={`hide-scrollbar overflow-y-auto ${isMulti ? 'overflow-x-auto max-h-[50vh]' : ''}`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            code({ className, children, inline }: CodeComponentProps) {

                                const match = /language-(\w+)/.exec(className || '');
                                const codeContent = String(children).replace(/\n$/, '');

                                if (!inline && match) {
                                    return <CodeBlock language={match[1]} value={codeContent} />;
                                }

                                return <code>{children}</code>;
                            },
                        }}

                    >
                        {splittedMessage.mainContent}
                    </ReactMarkdown>
                </div>
            </div>
            <div className="smallText pt-2 border-t border-[var(--color-separator)] mt-auto">
                <div className="flex">
                    <div
                        className="flex-1 flex gap-5"
                    >
                        <span>
                            {splittedMessage.token || 'N/A'} Tokens
                        </span>
                        <span>
                            {new Date(splittedMessage.timestamp).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })
                            }
                        </span>
                    </div>
                    <div
                        className="text-right"
                    >
                        <button
                            className="text-gray-400 hover:text-white transition-colors mr-1 cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(splittedMessage.mainContent);
                            }}
                        >
                            <FontAwesomeIcon icon={faRotateRight} onClick={() => regenerateMessage(splittedMessage.convId, splittedMessage.msgId, splittedMessage.author)} />
                        </button>
                    </div>
                </div>
            </div>
            {isLast && isMulti && (
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 cursor-pointer transition-colors duration-200 w-fit mx-auto text-md" onClick={() => { chooseReply(splittedMessage.convId, splittedMessage.msgId) }}>
                    Continue from this answer
                </button>
            )}
        </div>
    )
}