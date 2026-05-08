import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Bot, User, MessageSquare } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import MarkdownViewer from "../renderers/MarkdownViewer";

const ChatInterface = ({ videoUrl, sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // ✅ From Code 2 — smooth scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");

        // ✅ From Code 1 — optimistic UI update before API responds
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            // ✅ From Code 1 — correct API call with sessionId for stateful context
            const { data } = await api.post("/youtube/chat", {
                message: userMessage,
                videoUrl,
                sessionId,
            });

            if (data.success) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            } else {
                toast.error(data.message || "Failed to get response");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            // ✅ Remove the optimistic user message if request failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto h-full flex flex-col min-h-[500px]">

            {/* CHAT HISTORY */}
            <div className="flex-1 border border-gray-100 bg-gray-50 rounded-t-xl p-4 overflow-y-auto custom-scroll flex flex-col gap-6">

                {/* ✅ From Code 2 — better empty state UI */}
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="p-4 bg-purple-50 rounded-full mb-3">
                            <MessageSquare className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="font-medium text-gray-600">The AI has analyzed the video.</p>
                        <p className="text-sm">Ask questions like "What is the main conclusion?"</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* ✅ From Code 2 — cleaner avatar */}
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                                msg.role === "user" ? "bg-blue-600" : "bg-purple-600"
                            }`}>
                                {msg.role === "user"
                                    ? <User className="w-5 h-5 text-white" />
                                    : <Bot className="w-5 h-5 text-white" />
                                }
                            </div>

                            {/* MESSAGE BUBBLE */}
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                                msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                            }`}>
                                {msg.role === "user" ? (
                                    <p className="text-sm">{msg.content}</p>
                                ) : (
                                    // ✅ From Code 1 — MarkdownViewer renders mermaid + markdown correctly
                                    <MarkdownViewer content={msg.content} />
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* ✅ From Code 2 — animated typing indicator instead of plain text */}
                {loading && (
                    <div className="flex gap-4 flex-row">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <form
                onSubmit={handleSend}
                className="relative bg-white border border-t-0 border-gray-200 rounded-b-xl p-2 shrink-0"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the video..."
                    disabled={loading}
                    className="w-full py-3 pl-4 pr-12 bg-gray-50 border border-transparent rounded-lg outline-none focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;