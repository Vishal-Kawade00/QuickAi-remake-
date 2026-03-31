import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Download, FileText, Image as ImageIcon, Youtube, FileDown, AlignLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import MarkdownViewer from './renderers/MarkdownViewer';

const CreationItems = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = () => {
        switch (item.mappedType) {
            case 'text': return <AlignLeft className="w-5 h-5 text-blue-500" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-green-500" />;
            case 'document': return <FileText className="w-5 h-5 text-teal-500" />;
            case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPromptPreview = () => {
        if (item.mappedType === 'youtube') return item.title || item.videoUrl;
        if (item.mappedType === 'document') return `Analyzed Resume: ${item.fileName || 'Document'}`;
        if (item.mappedType === 'image' && !item.prompt) return `Image Edit: ${item.taskType.replace('_', ' ')}`;
        return item.prompt || 'No prompt provided';
    };

    const handleCopy = () => {
        const contentToCopy = item.content || item.aiFeedback || item.notes || item.summary || item.prompt;
        navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownloadImage = async () => {
        const toastId = toast.loading("Downloading image...");
        try {
            const response = await fetch(item.processedImageUrl, { mode: 'cors' });
            if (!response.ok) throw new Error("Network error");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QuickAi-Image-${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Image downloaded!", { id: toastId });
        } catch (error) {
            console.error("Image Download Error:", error);
            window.open(item.processedImageUrl, '_blank');
            toast.dismiss(toastId);
        }
    };

 const handleExportPDF = async () => {
    if (isGeneratingPDF) return;
    
    // 1. Point DIRECTLY to the live DOM element. No manual cloneNode!
    const originalElement = document.getElementById(`pdf-content-${item._id}`);
    if (!originalElement) {
        toast.error("Nothing to export");
        return;
    }

    setIsGeneratingPDF(true);
    const toastId = toast.loading("Preparing PDF...");

    try {
        const opt = {
            margin:       [0.5, 0.5, 0.5, 0.5],
            filename:     `QuickAi-Export-${Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
            html2canvas:  {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 800,
                // 2. Let html2canvas make the clone, then we sanitize it via CSS
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        /* Kill ALL gradients and background patterns to prevent 'createPattern' crashes */
                        * {
                            background-image: none !important;
                            box-shadow: none !important;
                        }
                        
                        /* Force a minimum size so the canvas never evaluates to 0x0 */
                        svg, canvas, hr {
                            min-width: 1px !important;
                            min-height: 1px !important;
                        }
                        
                        /* Strip scrolling to prevent the engine from freezing */
                        .overflow-x-auto, .overflow-y-auto, .custom-scroll {
                            overflow: visible !important;
                            max-width: 100% !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // 3. Generate directly from the live element
        await html2pdf().set(opt).from(originalElement).save();
        toast.success("PDF Downloaded!", { id: toastId });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast.error("Failed to export PDF. Please try again.", { id: toastId });
    } finally {
        setIsGeneratingPDF(false);
    }
};

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4">
            
            {/* COLLAPSED VIEW (Header) - Safe to use Tailwind colors here as it is NOT exported */}
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-gray-800 text-sm tracking-wide">{item.displayType}</span>
                            <span className="text-xs font-medium text-gray-400">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="text-gray-600 text-sm truncate pr-4">"{getPromptPreview()}"</p>
                    </div>
                </div>
                <div className="shrink-0 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* EXPANDED VIEW */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                    
                    {/* THE PDF TARGET CONTAINER - Strictly using pure HEX colors */}
                    <div id={`pdf-content-${item._id}`} className="p-6 bg-[#ffffff]">
                        
                        <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                            <h4 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">
                                {item.mappedType === 'document' ? 'Analyzed Document' : 'Original Prompt / Input'}
                            </h4>
                            <p className="font-medium leading-relaxed text-[#1f2937]">
                                {item.mappedType === 'youtube' ? (
                                    <a href={item.videoUrl} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                                        {item.title} ({item.videoUrl})
                                    </a>
                                ) : (
                                    getPromptPreview()
                                )}
                            </p>
                        </div>

                        <div className="text-[#1f2937]">
                            {item.mappedType === 'image' ? (
                                <div className="flex justify-center bg-[#f3f4f6] rounded-xl p-4">
                                    {/* Removed 'shadow-sm' to prevent oklch box-shadow crashes */}
                                    <img src={item.processedImageUrl} alt="Generated Content" className="max-h-96 rounded-lg" crossOrigin="anonymous" />
                                </div>
                            ) : item.mappedType === 'youtube' ? (
                                <MarkdownViewer content={item.notes || item.summary} />
                            ) : item.mappedType === 'document' ? (
                                <MarkdownViewer content={item.aiFeedback} />
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold text-[#111827] mb-4">{item.title}</h3>
                                    <MarkdownViewer content={item.content} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTION BAR - Safe to use Tailwind colors here */}
                    <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
                        {item.mappedType !== 'image' && (
                            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? 'Copied!' : 'Copy Text'}
                            </button>
                        )}

                        {item.mappedType === 'image' && (
                            <button onClick={handleDownloadImage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors">
                                <Download className="w-4 h-4" />
                                Download PNG
                            </button>
                        )}

                        {['youtube', 'document', 'text'].includes(item.mappedType) && (
                            <button onClick={handleExportPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition-colors">
                                {isGeneratingPDF ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><FileDown className="w-4 h-4" /> Export as PDF</>
                                )}
                            </button>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default CreationItems;