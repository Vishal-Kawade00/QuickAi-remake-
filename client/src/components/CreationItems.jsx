import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  FileText,
  Image as ImageIcon,
  Youtube,
  FileDown,
  AlignLeft,
  Loader2,
  MessageSquare,
  User,
  Bot,
} from "lucide-react";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import MarkdownViewer from "./renderers/MarkdownViewer";

const CreationItems = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = () => {
    switch (item.mappedType) {
      case "text":
        return <AlignLeft className="w-5 h-5 text-blue-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-green-500" />;
      case "document":
        return <FileText className="w-5 h-5 text-teal-500" />;
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "chat":
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPromptPreview = () => {
    if (item.mappedType === "youtube") return item.title || item.videoUrl;
    if (item.mappedType === "document")
      return `Analyzed Resume: ${item.fileName || "Document"}`;
    if (item.mappedType === "image" && !item.prompt)
      return `Image Edit: ${item.taskType.replace("_", " ")}`;
    if (item.mappedType === "chat") return item.title || "Chat Conversation";
    return item.prompt || "No prompt provided";
  };

  const handleCopy = () => {
    const contentToCopy =
      item.content ||
      item.aiFeedback ||
      item.notes ||
      item.summary ||
      item.prompt;
    navigator.clipboard.writeText(contentToCopy);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    const toastId = toast.loading("Downloading image...");
    try {
      const response = await fetch(item.processedImageUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network error");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QuickAi-Image-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!", { id: toastId });
    } catch (error) {
      console.error("Image Download Error:", error);
      window.open(item.processedImageUrl, "_blank");
      toast.dismiss(toastId);
    }
  };

 const handleExportPDF = async () => {
    if (isGeneratingPDF) return;

    const originalElement = document.getElementById(`pdf-content-${item._id}`);
    if (!originalElement) { 
        toast.error("Nothing to export"); 
        return; 
    }

    setIsGeneratingPDF(true);
    const toastId = toast.loading("Preparing export...");

    // ✅ NEW: Store the original HTML of the Mermaid containers to restore later
    const mermaidContainers = originalElement.querySelectorAll('.mermaid-output');
    const originalMermaidContents = new Map();
    mermaidContainers.forEach(container => {
        originalMermaidContents.set(container, container.innerHTML);
    });

    try {
        // STEP 1: Wait for all <img> tags to fully load first
        const images = originalElement.querySelectorAll('img');
        await Promise.allSettled(
            [...images].map(img =>
                img.complete ? Promise.resolve() :
                new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
            )
        );

        // STEP 2: Convert all Mermaid SVGs → PNG before html2canvas runs
        toast.loading("Converting diagrams...", { id: toastId });

        await Promise.allSettled(
            [...mermaidContainers].map(async (container) => {
                const liveSvg = container.querySelector('svg');
                if (!liveSvg) return;

                let svgUrl = null; // Track URL for safe cleanup

                try {
                    const rect = liveSvg.getBoundingClientRect();
                    const width = Math.max(rect.width, 200);
                    const height = Math.max(rect.height, 100);

                    const serializer = new XMLSerializer();
                    // Inject a namespace if missing to ensure it parses strictly as an SVG
                    if (!liveSvg.getAttribute('xmlns')) {
                        liveSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    }
                    const svgStr = serializer.serializeToString(liveSvg);
                    
                    // 👈 FIX 1: Use a Data URI instead of a Blob to bypass strict Blob-taint rules
                    const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);

                    await new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = "anonymous"; // 👈 FIX 2: Explicitly request safe cross-origin

                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                canvas.width = width * 2;
                                canvas.height = height * 2;
                                const ctx = canvas.getContext('2d');
                                ctx.scale(2, 2);
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, width, height);
                                ctx.drawImage(img, 0, 0, width, height);
                                
                                const pngImg = document.createElement('img');
                                // 👈 This will no longer throw the SecurityError!
                                pngImg.src = canvas.toDataURL('image/png'); 
                                pngImg.style.width = '100%';
                                pngImg.style.height = 'auto';
                                pngImg.style.display = 'block';
                                container.innerHTML = '';
                                container.appendChild(pngImg);
                            } catch (canvasErr) {
                                console.error("Canvas Taint Check Failed:", canvasErr);
                                container.innerHTML = `<p style="color:#6b7280;font-size:12px;font-style:italic;">[Diagram export blocked by browser security]</p>`;
                            }
                            resolve();
                        };
                        img.onerror = resolve; 
                        img.src = svgDataUri;
                    });
                } catch (err) {
                    console.error("SVG Serialization failed:", err);
                    container.innerHTML = `<p style="color:#6b7280;font-size:12px;font-style:italic;">[Diagram could not be exported]</p>`;
                } finally {
                    // ✅ Safely clean up the Blob URL regardless of success/fail
                    if (svgUrl) URL.revokeObjectURL(svgUrl);
                }
            })
        );

        // STEP 3: Short settle time after DOM mutation
        await new Promise(resolve => setTimeout(resolve, 300));

        toast.loading("Generating PDF...", { id: toastId });

        // STEP 4: Generate PDF
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `QuickAi-${(item.displayType || 'Export').replace(/\s+/g, '-')}-${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 800,
                backgroundColor: '#ffffff',
                ignoreElements: (el) => {
                    if (el.offsetWidth === 0 && el.offsetHeight === 0) return true;
                    if (el.getAttribute('role') === 'tooltip') return true;
                    if (el.classList?.contains('animate-spin')) return true;
                    return false;
                },
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        * {
                            background-image: none !important;
                            box-shadow: none !important;
                            text-shadow: none !important;
                            animation: none !important;
                            transition: none !important;
                        }
                        svg, canvas {
                            min-width: 1px !important;
                            min-height: 1px !important;
                        }
                        .overflow-x-auto, .overflow-y-auto, .custom-scroll {
                            overflow: visible !important;
                            max-width: 100% !important;
                        }
                    `;
                    
                    // 👇 THE FIX: Safely find a place to attach the style tag
                    const target = clonedDoc.head || clonedDoc.body || clonedDoc.documentElement;
                    if (target) {
                        target.appendChild(style);
                    }

                    // ... keep your existing SVG sizing logic below this
                    clonedDoc.querySelectorAll('svg').forEach(svg => {
                        const w = svg.getAttribute('width') || '200';
                        const h = svg.getAttribute('height') || '100';
                        svg.setAttribute('width', Math.max(parseInt(w), 1));
                        svg.setAttribute('height', Math.max(parseInt(h), 1));
                    });
                }
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(originalElement).save();
        toast.success("PDF Downloaded!", { id: toastId });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast.error("Failed to export PDF. Please try again.", { id: toastId });
    } finally {
        // ✅ STEP 5: Clean, invisible restoration
        // Instantly puts the SVGs back into the DOM without forcing React to unmount the UI
        originalMermaidContents.forEach((originalHtml, container) => {
            container.innerHTML = originalHtml;
        });
        
        setIsGeneratingPDF(false);
    }
};

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4">
      {/* COLLAPSED VIEW (Header) - Safe to use Tailwind colors here as it is NOT exported */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-bold text-gray-800 text-sm tracking-wide">
                {item.displayType}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {formatDate(item.createdAt)}
              </span>
            </div>
            <p className="text-gray-600 text-sm truncate pr-4">
              "{getPromptPreview()}"
            </p>
          </div>
        </div>
        <div className="shrink-0 text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* EXPANDED VIEW */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* THE PDF TARGET CONTAINER - Strictly using pure HEX colors */}
          <div id={`pdf-content-${item._id}`} className="p-6 bg-[#ffffff]">
            <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
              <h4 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">
                {item.mappedType === "document"
                  ? "Analyzed Document"
                  : "Original Prompt / Input"}
              </h4>
              <p className="font-medium leading-relaxed text-[#1f2937]">
                {item.mappedType === "youtube" ? (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563eb] hover:underline"
                  >
                    {item.title} ({item.videoUrl})
                  </a>
                ) : (
                  getPromptPreview()
                )}
              </p>
            </div>

            <div className="text-[#1f2937]">
              {item.mappedType === "image" ? (
                <div className="flex justify-center bg-[#f3f4f6] rounded-xl p-4">
                  {/* Removed 'shadow-sm' to prevent oklch box-shadow crashes */}
                  <img
                    src={item.processedImageUrl}
                    alt="Generated Content"
                    className="max-h-96 rounded-lg"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : item.mappedType === "youtube" ? (
                <MarkdownViewer content={item.notes || item.summary} />
              ) : item.mappedType === "document" ? (
                <MarkdownViewer content={item.aiFeedback} />
              ) : item.mappedType === "chat" ? (
                // 👇 MATCHING LIVE CHAT UI (WITH PDF-SAFE COLORS) 👇
                <div className="space-y-6 flex flex-col">
                  {item.messages &&
                    item.messages.map((msg, index) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={index}
                          className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 ${
                              isUser
                                ? "bg-[#2563eb] text-[#ffffff]"
                                : "bg-[#9333ea] text-[#ffffff]"
                            }`}
                          >
                            {isUser ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Bot className="w-5 h-5" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              isUser
                                ? "bg-[#2563eb] text-[#ffffff] rounded-tr-none"
                                : "bg-[#ffffff] border border-[#e5e7eb] text-[#1f2937] rounded-tl-none"
                            }`}
                          >
                            {isUser ? (
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.content || msg.text}
                              </p>
                            ) : (
                              // Using our custom safe MarkdownViewer instead of Tailwind 'prose'
                              <div className="max-w-none">
                                <MarkdownViewer
                                  content={msg.content || msg.text}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-[#111827] mb-4">
                    {item.title}
                  </h3>
                  <MarkdownViewer content={item.content} />
                </div>
              )}
            </div>
          </div>

          {/* ACTION BAR - Safe to use Tailwind colors here */}
          <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
            {item.mappedType !== "image" && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {isCopied ? "Copied!" : "Copy Text"}
              </button>
            )}

            {item.mappedType === "image" && (
              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            )}

            {["youtube", "document", "text", "chat"].includes(
              item.mappedType,
            ) && (
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition-colors"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" /> Export as PDF
                  </>
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