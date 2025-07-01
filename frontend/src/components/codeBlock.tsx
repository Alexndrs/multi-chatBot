import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

export function CodeBlock({ language, value }: { language: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute top-1 right-1 text-xs text-gray-300 bg-gray-800 border border-gray-600 px-2 py-1 rounded-md hover:bg-gray-700 hover:cursor-pointer transition-colors"
            >
                {copied ? 'Copied !' : 'Copy'}
            </button>

            <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                    background: 'transparent',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    margin: 0,
                    minWidth: '50vw',
                }}


            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
}
