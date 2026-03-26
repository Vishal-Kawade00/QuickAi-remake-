import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';

const MarkdownViewer = ({ content }) => {
    if (!content) return null;

    return (
        <div className="max-w-none text-gray-800">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // ✅ Code blocks (multi-line wrapper)
                    // We return fragments here so the nested <code> tag handles all the styling logic
                    pre({ children }) {
                        return <>{children}</>;
                    },

                    // ✅ Core Code Logic (Handles Mermaid, Standard Blocks, and Inline)
                    code({ className, children }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : null;
                        const codeText = String(children).replace(/\n$/, '');

                        // 1. Mermaid diagram interception
                        if (language === 'mermaid') {
                            return <MermaidDiagram chart={codeText} />;
                        }

                        // 2. Multi-line code block (detects if it has a language class or contains newlines)
                        if (className || codeText.includes('\n')) {
                            return (
                                <div className="my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                    {language && (
                                        <div className="bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            {language}
                                        </div>
                                    )}
                                    <div className="bg-gray-50 overflow-x-auto p-4">
                                        <code className="text-sm font-mono text-gray-800 whitespace-pre">
                                            {codeText}
                                        </code>
                                    </div>
                                </div>
                            );
                        }

                        // 3. Inline code snippet (e.g., `const x = 5;`)
                        return (
                            <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md text-sm font-mono">
                                {children}
                            </code>
                        );
                    },

                    // ✅ Headings
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-1 border-b border-gray-100">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">
                            {children}
                        </h4>
                    ),

                    // ✅ Paragraph
                    p: ({ children }) => (
                        <p className="text-gray-700 leading-7 mb-4 text-base">
                            {children}
                        </p>
                    ),

                    // ✅ Lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-gray-700">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-gray-700">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-7 text-base">
                            {children}
                        </li>
                    ),

                    // ✅ Blockquote
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-indigo-300 bg-indigo-50 pl-4 pr-3 py-2 my-4 rounded-r-lg text-gray-700 italic">
                            {children}
                        </blockquote>
                    ),

                    // ✅ Horizontal rule (used as section divider ---)
                    hr: () => (
                        <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    ),

                    // ✅ Bold & Italic
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-600">{children}</em>
                    ),

                    // ✅ Table (Enabled by remarkGfm)
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-indigo-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            {children}
                        </th>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-gray-700">{children}</td>
                    ),

                    // ✅ Links (FIXED: Added the missing `<a` tag)
                    a: ({ href, children }) => (
                        <a 
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownViewer;