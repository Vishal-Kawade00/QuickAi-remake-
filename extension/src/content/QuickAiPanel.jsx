// QuickAiPanel.jsx — The main UI panel injected on YouTube pages

import React, { useState, useEffect, useRef } from "react";
import { getVideoId, getVideoTitle, getFullTranscriptText } from "./scraper.js";

const COLORS = {
  bg: "#0f0f0f",
  surface: "#1a1a1a",
  border: "#2a2a2a",
  accent: "#7c6fcd",
  accentHover: "#9d92e8",
  text: "#e8e8e8",
  textMuted: "#888",
  success: "#4ade80",
  error: "#f87171",
  userBubble: "#7c6fcd",
  aiBubble: "#252525",
};

const styles = {
  panel: {
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "16px",
    color: COLORS.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  logo: {
    background: `linear-gradient(135deg, ${COLORS.accent}, #a78bfa)`,
    borderRadius: "8px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "12px",
    color: "#fff",
    flexShrink: 0,
  },
  title: { fontWeight: "700", fontSize: "15px", color: COLORS.text },
  subtitle: { fontSize: "11px", color: COLORS.textMuted },
  btnRow: { display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" },
  btn: (variant = "primary", active = false) => ({
    flex: 1,
    minWidth: "80px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
    transition: "all 0.2s",
    background:
      variant === "primary"
        ? active
          ? COLORS.accent
          : COLORS.surface
        : COLORS.surface,
    color: active ? "#fff" : COLORS.textMuted,
    outline: active ? `1px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
  }),
  output: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "12px",
    minHeight: "80px",
    maxHeight: "300px",
    overflowY: "auto",
    fontSize: "13px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    color: COLORS.text,
  },
  chatWindow: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  messages: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px 8px 0 0",
    padding: "10px",
    height: "220px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  msgUser: {
    alignSelf: "flex-end",
    background: COLORS.userBubble,
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "10px 10px 2px 10px",
    maxWidth: "85%",
    fontSize: "13px",
  },
  msgAi: {
    alignSelf: "flex-start",
    background: COLORS.aiBubble,
    color: COLORS.text,
    padding: "6px 10px",
    borderRadius: "10px 10px 10px 2px",
    maxWidth: "85%",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
  },
  chatInputRow: {
    display: "flex",
    border: `1px solid ${COLORS.border}`,
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    overflow: "hidden",
  },
  chatInput: {
    flex: 1,
    background: COLORS.surface,
    border: "none",
    outline: "none",
    padding: "8px 12px",
    color: COLORS.text,
    fontSize: "13px",
  },
  sendBtn: {
    background: COLORS.accent,
    border: "none",
    color: "#fff",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "8px",
    fontSize: "11px",
    color: COLORS.textMuted,
  },
  dot: (color) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),
  errorBox: {
    background: "#2a1a1a",
    border: `1px solid ${COLORS.error}`,
    borderRadius: "8px",
    padding: "10px",
    color: COLORS.error,
    fontSize: "12px",
    marginTop: "8px",
  },
};

// ─── Utility: send message to background ─────────────────────────────────────
function sendToBackground(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, resolve);
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuickAiPanel() {
  const [mode, setMode] = useState(null); // null | 'summarize' | 'notes' | 'chat'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState(null);
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // ── Check auth on mount ────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  // ── Scroll chat to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function checkAuth() {
    const res = await sendToBackground({ type: "GET_JWT" });
    setAuthenticated(!!res?.token);
  }

  // ── Action: Summarize ─────────────────────────────────────────────────────
  async function handleSummarize() {
    setMode("summarize");
    setError(null);
    setOutput("");
    setLoading(true);
    setStatus("Extracting transcript...");

    try {
      const videoId = getVideoId();
      const title = getVideoTitle();
      const transcript = await getFullTranscriptText();
      setStatus("Sending to AI...");

      const res = await sendToBackground({
        type: "API_SUMMARIZE",
        payload: { videoId, title, transcript },
      });

      if (res.error) throw new Error(res.error);
      setOutput(res.data.summary || JSON.stringify(res.data, null, 2));
      setSessionId(res.data.sessionId);
      setStatus("Done ✓");
    } catch (err) {
      setError(err.message);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  // ── Action: Detailed Notes ─────────────────────────────────────────────────
  async function handleDetailedNotes() {
    setMode("notes");
    setError(null);
    setOutput("");
    setLoading(true);
    setStatus("Extracting transcript...");

    try {
      const videoId = getVideoId();
      const title = getVideoTitle();
      const transcript = await getFullTranscriptText();
      setStatus("Generating detailed notes (this may take a minute)...");

      const res = await sendToBackground({
        type: "API_DETAILED_NOTES",
        payload: { videoId, title, transcript },
      });

      if (res.error) throw new Error(res.error);
      setOutput(res.data.notes || JSON.stringify(res.data, null, 2));
      setSessionId(res.data.sessionId);
      setStatus("Notes generated ✓ — View full version in QuickAi dashboard");
    } catch (err) {
      setError(err.message);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  // ── Action: Open Chat ──────────────────────────────────────────────────────
  async function handleOpenChat() {
    setMode("chat");
    setError(null);
    setOutput("");
    setLoading(true);
    setStatus("Initializing conversation...");

    try {
      const videoId = getVideoId();
      // Load existing session if any
      const res = await sendToBackground({ type: "API_GET_SESSION", videoId });
      if (res.data?.chatHistory) {
        setMessages(res.data.chatHistory);
        setSessionId(res.data._id);
      } else {
        // Inject transcript as context for this session
        const transcript = await getFullTranscriptText();
        const title = getVideoTitle();
        // Store context via a chat init call
        const init = await sendToBackground({
          type: "API_CHAT",
          payload: {
            videoId,
            title,
            transcript,
            message: null,
            initSession: true,
          },
        });
        if (init.error) throw new Error(init.error);
        setSessionId(init.data.sessionId);
        setMessages([
          {
            role: "assistant",
            content: `Hi! I've read the video "${title}". Ask me anything about it!`,
          },
        ]);
      }
      setStatus("Chat ready ✓");
    } catch (err) {
      setError(err.message);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  // ── Action: Send Chat Message ──────────────────────────────────────────────
  async function handleSendMessage() {
    const msg = chatInput.trim();
    if (!msg || loading) return;

    setChatInput("");
    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStatus("Thinking...");

    try {
      const res = await sendToBackground({
        type: "API_CHAT",
        payload: {
          sessionId,
          videoId: getVideoId(),
          message: msg,
        },
      });

      if (res.error) throw new Error(res.error);
      const aiMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      setStatus("Chat ready ✓");
    } catch (err) {
      setError(err.message);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>Q</div>
        <div>
          <div style={styles.title}>QuickAi</div>
          <div style={styles.subtitle}>
            {authenticated ? "Logged in ✓" : "⚠ Not logged in — open QuickAi web app first"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.btnRow}>
        <button
          style={styles.btn("primary", mode === "summarize")}
          onClick={handleSummarize}
          disabled={!authenticated || loading}
          title="Generate a quick summary of this video"
        >
          {loading && mode === "summarize" ? "..." : "⚡ Summarize"}
        </button>
        <button
          style={styles.btn("primary", mode === "notes")}
          onClick={handleDetailedNotes}
          disabled={!authenticated || loading}
          title="Generate full textbook-style notes"
        >
          {loading && mode === "notes" ? "..." : "📚 Notes"}
        </button>
        <button
          style={styles.btn("primary", mode === "chat")}
          onClick={handleOpenChat}
          disabled={!authenticated || loading}
          title="Chat with an AI tutor about this video"
        >
          {loading && mode === "chat" ? "..." : "💬 Chat"}
        </button>
      </div>

      {/* Error Box */}
      {error && <div style={styles.errorBox}>⚠ {error}</div>}

      {/* Output: Summarize / Notes */}
      {(mode === "summarize" || mode === "notes") && !loading && output && (
        <div style={styles.output}>{output}</div>
      )}

      {/* Loading state */}
      {loading && mode !== "chat" && (
        <div style={{ ...styles.output, color: COLORS.textMuted, fontStyle: "italic" }}>
          {status}
        </div>
      )}

      {/* Chat Window */}
      {mode === "chat" && (
        <div style={styles.chatWindow}>
          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? styles.msgUser : styles.msgAi}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.msgAi, color: COLORS.textMuted, fontStyle: "italic" }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={styles.chatInputRow}>
            <input
              style={styles.chatInput}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about this video..."
              disabled={loading}
            />
            <button style={styles.sendBtn} onClick={handleSendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div
          style={styles.dot(
            status.includes("Error")
              ? COLORS.error
              : loading
              ? COLORS.accent
              : COLORS.success
          )}
        />
        {status}
      </div>
    </div>
  );
}