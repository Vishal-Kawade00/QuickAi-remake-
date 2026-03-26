import React, { useState } from 'react';
import MarkDown from 'react-markdown';
import { Image as ImageIcon, FileText, AlignLeft, PlaySquare, ExternalLink } from 'lucide-react';

const CreationItems = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    // Dynamic icon selection based on the creation type
    const getIcon = () => {
        switch (item.displayType) {
            case 'Image Tool': return <ImageIcon className="w-5 h-5 text-green-500" />;
            case 'Document Tool': return <FileText className="w-5 h-5 text-teal-500" />;
            case 'Study Session': return <PlaySquare className="w-5 h-5 text-red-500" />;
            default: return <AlignLeft className="w-5 h-5 text-blue-500" />; // Articles & Titles
        }
    };

    // Dynamic badge styling
    const getBadgeStyle = () => {
        switch (item.displayType) {
            case 'Image Tool': return "bg-green-50 text-green-700 border-green-200";
            case 'Document Tool': return "bg-teal-50 text-teal-700 border-teal-200";
            case 'Study Session': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    // Determine what content to render based on the polymorphic data model
    const renderContent = () => {
        if (item.displayType === 'Image Tool') {
            return (
                <div className="flex justify-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <img
                        src={item.resultUrl}
                        alt={item.displayTitle}
                        className="max-h-96 object-contain rounded shadow-sm"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = '<div class="text-red-500 p-4">Image no longer available or failed to load.</div>';
                        }}
                    />
                </div>
            );
        }

        if (item.displayType === 'Document Tool') {
            return (
                <div className="text-sm text-slate-700 custom-scroll">
                    <div className="mb-4">
                        <a 
                            href={item.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm bg-teal-50 px-3 py-1.5 rounded-md transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" /> View Original PDF
                        </a>
                    </div>
                    <div className="prose prose-sm max-w-none prose-teal">
                        <MarkDown>{item.feedback || "No feedback available."}</MarkDown>
                    </div>
                </div>
            );
        }

        if (item.displayType === 'Study Session') {
            return (
                <div className="text-sm text-slate-700 custom-scroll">
                    <div className="prose prose-sm max-w-none prose-red">
                        <MarkDown>{item.summary || "No summary available."}</MarkDown>
                    </div>
                </div>
            );
        }

        // Default for Articles and Blog Titles (TextContent)
        return (
            <div className="text-sm text-slate-700 custom-scroll">
                <div className="prose prose-sm max-w-none prose-blue">
                    <MarkDown>{item.content || "No content available."}</MarkDown>
                </div>
            </div>
        );
    };

    return (
        <div
            className="w-full bg-white border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 overflow-hidden"
            onClick={(e) => {
                // Prevents toggling when a user is selecting text to copy or clicking a link
                if (window.getSelection().toString() || e.target.tagName.toLowerCase() === 'a') return;
                setExpanded(!expanded);
            }}
        >
            {/* Header Area */}
            <div className="p-4 flex justify-between items-center gap-4 bg-white">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-800 truncate text-base">
                            {item.displayTitle || "Untitled Creation"}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500 font-medium">
                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
                
                <button className={`flex-shrink-0 border px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getBadgeStyle()}`}>
                    {item.displayType}
                </button>
            </div>

            {/* Expandable Body Area */}
            <div className={`transition-all duration-300 ease-in-out ${expanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 border-t border-gray-100 bg-gray-50/30 max-h-[600px] overflow-y-auto custom-scroll">
                    {/* Render specific prompt if applicable */}
                    {item.prompt && item.displayType !== 'Document Tool' && item.displayType !== 'Study Session' && (
                        <div className="mb-4 pb-3 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Prompt Used:</span>
                            <p className="text-sm text-gray-700 italic">"{item.prompt}"</p>
                        </div>
                    )}
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default CreationItems;