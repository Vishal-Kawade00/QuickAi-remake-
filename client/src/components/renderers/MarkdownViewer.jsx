import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';

const MarkdownViewer = ({ content }) => {
    if (!content) return null;

    return (
        // Replaced text-gray-800
        <div className="max-w-none text-[#1f2937]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // ✅ Code blocks
                    pre({ children }) {
                        return <>{children}</>;
                    },

                    // ✅ Core Code Logic
                    code({ className, children }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : null;
                        const codeText = String(children).replace(/\n$/, '');

                        if (language === 'mermaid') {
                            return <MermaidDiagram chart={codeText} />;
                        }

                        if (className || codeText.includes('\n')) {
                            return (
                                // Replaced border-gray-200
                                <div className="my-4 rounded-xl overflow-hidden border border-[#e5e7eb] shadow-sm">
                                    {language && (
                                        // Replaced bg-gray-100, text-gray-500, border-gray-200
                                        <div className="bg-[#f3f4f6] px-4 py-1.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-b border-[#e5e7eb]">
                                            {language}
                                        </div>
                                    )}
                                    {/* Replaced bg-gray-50 */}
                                    <div className="bg-[#f9fafb] overflow-x-auto p-4">
                                        {/* Replaced text-gray-800 */}
                                        <code className="text-sm font-mono text-[#1f2937] whitespace-pre">
                                            {codeText}
                                        </code>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            // Replaced bg-indigo-50, text-indigo-600
                            <code className="bg-[#eef2ff] text-[#4f46e5] px-1.5 py-0.5 rounded-md text-sm font-mono">
                                {children}
                            </code>
                        );
                    },

                    // ✅ Headings
                    h1: ({ children }) => (
                        // Replaced text-gray-900, border-gray-200
                        <h1 className="text-2xl font-bold text-[#111827] mt-8 mb-4 pb-2 border-b border-[#e5e7eb]">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        // Replaced text-gray-800, border-gray-100
                        <h2 className="text-xl font-bold text-[#1f2937] mt-6 mb-3 pb-1 border-b border-[#f3f4f6]">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        // Replaced text-gray-800
                        <h3 className="text-lg font-semibold text-[#1f2937] mt-5 mb-2">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        // Replaced text-gray-700
                        <h4 className="text-base font-semibold text-[#374151] mt-4 mb-2">
                            {children}
                        </h4>
                    ),

                    // ✅ Paragraph
                    p: ({ children }) => (
                        // Replaced text-gray-700
                        <p className="text-[#374151] leading-7 mb-4 text-base">
                            {children}
                        </p>
                    ),

                    // ✅ Lists
                    ul: ({ children }) => (
                        // Replaced text-gray-700
                        <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-[#374151]">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        // Replaced text-gray-700
                        <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-[#374151]">
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
                        // Replaced border-indigo-300, bg-indigo-50, text-gray-700
                        <blockquote className="border-l-4 border-[#a5b4fc] bg-[#eef2ff] pl-4 pr-3 py-2 my-4 rounded-r-lg text-[#374151] italic">
                            {children}
                        </blockquote>
                    ),

                    // ✅ Horizontal rule
                    hr: () => (
                        // Replaced via-gray-300
                        <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-[#d1d5db] to-transparent" />
                    ),

                    // ✅ Bold & Italic
                    strong: ({ children }) => (
                        // Replaced text-gray-900
                        <strong className="font-semibold text-[#111827]">{children}</strong>
                    ),
                    em: ({ children }) => (
                        // Replaced text-gray-600
                        <em className="italic text-[#4b5563]">{children}</em>
                    ),

                    // ✅ Table
                    table: ({ children }) => (
                        // Replaced border-gray-200
                        <div className="overflow-x-auto my-6 rounded-xl border border-[#e5e7eb] shadow-sm">
                            {/* Replaced divide-gray-200 */}
                            <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        // Replaced bg-indigo-50
                        <thead className="bg-[#eef2ff]">{children}</thead>
                    ),
                    th: ({ children }) => (
                        // Replaced text-indigo-700
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#4338ca] uppercase tracking-wider">
                            {children}
                        </th>
                    ),
                    tbody: ({ children }) => (
                        // Replaced divide-gray-100, bg-white
                        <tbody className="divide-y divide-[#f3f4f6] bg-[#ffffff]">{children}</tbody>
                    ),
                    td: ({ children }) => (
                        // Replaced text-gray-700
                        <td className="px-4 py-3 text-[#374151]">{children}</td>
                    ),

                    // ✅ Links
                    a: ({ href, children }) => (
                        // Replaced text-indigo-600, hover:text-indigo-800
                        <a 
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4f46e5] hover:text-[#3730a3] underline underline-offset-2 transition-colors"
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