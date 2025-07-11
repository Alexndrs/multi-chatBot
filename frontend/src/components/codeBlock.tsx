import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';

// Langages de programmation
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import py from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';

// Web / front-end
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

// Shell & scripting
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';

// Query / config
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';

// Register all
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', py);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);

SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('json', json);

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('powershell', powershell);

SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('toml', toml);
SyntaxHighlighter.registerLanguage('ini', ini);
SyntaxHighlighter.registerLanguage('docker', docker);


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
