import React, { useState } from "react";
import {
  Youtube,
  MessageSquare,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import api from "../api/axios";
import ChatInterface from "../components/common/ChatInterface";
import MarkdownViewer from "../components/renderers/MarkdownViewer";

const StudySessions = () => {
  const [url, setUrl] = useState("");
  const [activeMode, setActiveMode] = useState(null); // 'summary', 'chat', or 'notes'
  const [loading, setLoading] = useState(false);

  // State for the different outputs
  const [summaryContent, setSummaryContent] = useState("");
  const [notesContent, setNotesContent] = useState("");
  // Chat state will be expanded when we build the full chat hook
  const [chatHistory, setChatHistory] = useState([]);

  const handleAction = async (mode) => {
    if (!url.trim()) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    // Basic YouTube URL validation
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube link");
      return;
    }

    setActiveMode(mode);
    setLoading(true);

    try {
      // Route the request based on the button clicked
      if (mode === "summary") {
        const { data } = await api.post("/youtube/summarize", {
          videoUrl: url,
        });
        if (data.success) {
          setSummaryContent(data.summary);
          toast.success("Summary generated!");
        } else toast.error(data.message);
      } else if (mode === "notes") {
        // This hits your chunking pipeline for massive documents
        const { data } = await api.post("/youtube/detailed-notes", {
          videoUrl: url,
        });
        if (data.success) {
          setNotesContent(data.notes);
          toast.success("Detailed notes generated!");
        } else toast.error(data.message);
      } else if (mode === "chat") {
        // Initialize the chat session
        toast.success("Chat session initialized. Ask your first question!");
        // We will build the chat input UI in the render section below
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred processing this video",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-6 text-slate-700 custom-scroll">
      {/* TOP SECTION: Input & Controls */}
      <div className="w-full bg-white border rounded-xl border-gray-200 p-6 shadow-sm shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Youtube className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              YouTube AI Tutor
            </h1>
            <p className="text-sm text-gray-500">
              Transform any video into interactive study materials
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="relative flex items-center mb-6">
            <Youtube className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Paste YouTube Video URL here (e.g., https://www.youtube.com/watch?v=...)"
              className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Summarize */}
            <button
              onClick={() => handleAction("summary")}
              disabled={loading}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                activeMode === "summary"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FileText
                className={`w-6 h-6 mb-2 ${activeMode === "summary" ? "text-blue-600" : "text-gray-500"}`}
              />
              <span className="font-semibold text-sm">Quick Summary</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Single-shot overview
              </span>
            </button>

            {/* Action 2: Chat */}
            <button
              onClick={() => handleAction("chat")}
              disabled={loading}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                activeMode === "chat"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <MessageSquare
                className={`w-6 h-6 mb-2 ${activeMode === "chat" ? "text-purple-600" : "text-gray-500"}`}
              />
              <span className="font-semibold text-sm">Interactive Chat</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Stateful Q&A memory
              </span>
            </button>

            {/* Action 3: Detailed Notes */}
            <button
              onClick={() => handleAction("notes")}
              disabled={loading}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                activeMode === "notes"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <BookOpen
                className={`w-6 h-6 mb-2 ${activeMode === "notes" ? "text-red-600" : "text-gray-500"}`}
              />
              <span className="font-semibold text-sm">Detailed Notes</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Full textbook generation
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Dynamic Output Canvas */}
      <div className="w-full flex-1 bg-white border rounded-xl border-gray-200 min-h-[500px] flex flex-col shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-1 flex-col justify-center items-center">
            <span className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></span>
            <p className="text-gray-500 font-medium">
              {activeMode === "notes"
                ? "Analyzing transcript and generating textbook chunks..."
                : "Processing video..."}
            </p>
          </div>
        ) : !activeMode ? (
          <div className="flex flex-1 flex-col justify-center items-center text-gray-400 p-6 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Youtube className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-600">No Video Loaded</p>
            <p className="max-w-md mt-2">
              Paste a link above and choose a study mode to generate AI-powered
              insights.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 custom-scroll">
            {/* Render Summary Mode */}
            {activeMode === "summary" && summaryContent && (
              <div className="max-w-4xl mx-auto">
                <MarkdownViewer content={summaryContent} />
              </div>
            )}

            {activeMode === "notes" && notesContent && (
              <div className="max-w-4xl mx-auto">
                <MarkdownViewer content={notesContent} />
              </div>
            )}

            {/* Render Chat Mode (Preview shell) */}
            {activeMode === "chat" && <ChatInterface videoUrl={url} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySessions;
