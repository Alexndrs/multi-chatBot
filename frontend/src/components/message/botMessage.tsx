import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../codeBlock';
import remarkGfm from 'remark-gfm';

import type { ComponentPropsWithoutRef } from 'react';

type CodeComponentProps = ComponentPropsWithoutRef<'code'> & {
    inline?: boolean;
};




export function BotMessage({ message, onReload, token }: { message: string | null; onReload: () => void; token: number }) {

    return (

        <div className="self-start ml-15 mt-5 w-fit max-w-[90%]">
            <div className="prose prose-invert max-w-none text-gray-300 text-sm p-4">
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
                    {message || ''}
                </ReactMarkdown>

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