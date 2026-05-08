import React, { useState, useEffect } from "react";
import { Youtube, MessageSquare, BookOpen, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import ChatInterface from "../components/common/ChatInterface";
import MarkdownViewer from "../components/renderers/MarkdownViewer";

const StudySessions = () => {
    const [searchParams] = useSearchParams();
    const [url, setUrl] = useState("");
    const [activeMode, setActiveMode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [summaryContent, setSummaryContent] = useState("");
    const [notesContent, setNotesContent] = useState("");

    // ✅ From Code 1 — restores URL and sessionId from query params
    const extractVideoId = (videoUrl) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        return match && match[7].length === 11 ? match[7] : null;
    };

    useEffect(() => {
        const videoId = searchParams.get("v");
        const existingSession = searchParams.get("sessionId");
        if (videoId) setUrl(`https://www.youtube.com/watch?v=${videoId}`);
        if (existingSession) setSessionId(existingSession);
    }, [searchParams]);

    const handleAction = async (mode) => {
        if (!url.trim()) return toast.error("Please enter a valid YouTube URL");

        // ✅ From Code 1 — proper video ID extraction instead of loose string check
        const videoId = extractVideoId(url);
        if (!videoId) return toast.error("Invalid YouTube URL format");

        setActiveMode(mode);
        setLoading(true);

        try {
            // ✅ From Code 1 — fetch transcript via backend proxy to bypass CORS
            const transcriptRes = await api.get(`/youtube/transcript/${videoId}`);
            if (!transcriptRes.data.success) throw new Error("Transcript fetch failed");

            const transcript = transcriptRes.data.transcript;
            const payload = { videoUrl: url, transcript, sessionId };

            if (mode === "summary") {
                const { data } = await api.post("/youtube/summarize", payload);
                if (data.success) {
                    setSummaryContent(data.summary);
                    setSessionId(data.sessionId);
                    toast.success("Summary generated!");
                } else toast.error(data.message);

            } else if (mode === "notes") {
                const { data } = await api.post("/youtube/detailed-notes", payload);
                if (data.success) {
                    setNotesContent(data.notes);
                    setSessionId(data.sessionId);
                    toast.success("Detailed notes generated!");
                } else toast.error(data.message);

            } else if (mode === "chat") {
                // ✅ From Code 1 — initializes chat with transcript context
                const { data } = await api.post("/youtube/chat", {
                    ...payload,
                    message: "Analyze this video transcript.",
                });
                if (data.success) {
                    setSessionId(data.sessionId);
                    toast.success("Chat ready! Ask your first question.");
                } else toast.error(data.message);
            }

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to process video"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-6 text-slate-700 custom-scroll">

            {/* INPUT SECTION */}
            <div className="w-full bg-white border rounded-xl border-gray-200 p-6 shadow-sm shrink-0">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <Youtube className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">YouTube AI Tutor</h1>
                        <p className="text-sm text-gray-500">Transform any video into interactive study materials</p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <div className="relative flex items-center mb-6">
                        <Youtube className="absolute left-4 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Paste YouTube Video URL here..."
                            className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    {/* ✅ From Code 2 — better button descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleAction("summary")}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                activeMode === "summary"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                            }`}
                        >
                            <FileText className={`w-6 h-6 mb-2 ${activeMode === "summary" ? "text-blue-600" : "text-gray-500"}`} />
                            <span className="font-semibold text-sm">Quick Summary</span>
                            <span className="text-xs text-gray-500 mt-1 text-center">Single-shot overview</span>
                        </button>

                        <button
                            onClick={() => handleAction("chat")}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                activeMode === "chat"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                            }`}
                        >
                            <MessageSquare className={`w-6 h-6 mb-2 ${activeMode === "chat" ? "text-purple-600" : "text-gray-500"}`} />
                            <span className="font-semibold text-sm">Interactive Chat</span>
                            <span className="text-xs text-gray-500 mt-1 text-center">Stateful Q&A memory</span>
                        </button>

                        <button
                            onClick={() => handleAction("notes")}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                activeMode === "notes"
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
                            }`}
                        >
                            <BookOpen className={`w-6 h-6 mb-2 ${activeMode === "notes" ? "text-red-600" : "text-gray-500"}`} />
                            <span className="font-semibold text-sm">Detailed Notes</span>
                            <span className="text-xs text-gray-500 mt-1 text-center">Full textbook generation</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* OUTPUT SECTION */}
            <div className="w-full flex-1 bg-white border rounded-xl border-gray-200 min-h-[500px] flex flex-col shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-1 flex-col justify-center items-center">
                        <span className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium italic">
                            {activeMode === "notes"
                                ? "Analyzing transcript and generating notes..."
                                : "Gemini AI is processing your video..."}
                        </p>
                    </div>
                ) : !activeMode ? (
                    <div className="flex flex-1 flex-col justify-center items-center text-gray-400 p-6 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Youtube className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">No Video Loaded</p>
                        <p className="max-w-md mt-2 text-sm">
                            Paste a link above and choose a study mode to generate AI-powered insights.
                        </p>
                    </div>
                ) : (
                    // ✅ From Code 2 — max-w-4xl wrapper keeps MarkdownViewer readable
                    <div className="flex-1 overflow-y-auto p-6 custom-scroll">
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
                        {/* ✅ From Code 1 — passes sessionId so chat has transcript context */}
                        {activeMode === "chat" && (
                            <ChatInterface videoUrl={url} sessionId={sessionId} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySessions;