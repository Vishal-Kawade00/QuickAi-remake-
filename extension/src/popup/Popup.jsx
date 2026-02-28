// Popup.jsx — Extension popup when clicking the toolbar icon

import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function sendToBackground(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

function Popup() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await sendToBackground({ type: "GET_JWT" });
    setAuthenticated(!!res?.token);
    setLoading(false);
  }

  async function handleLogout() {
    await sendToBackground({ type: "CLEAR_JWT" });
    setAuthenticated(false);
    setCleared(true);
  }

  const styles = {
    container: {
      padding: "16px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e8e8e8",
      background: "#0f0f0f",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "14px",
      borderBottom: "1px solid #222",
      paddingBottom: "12px",
    },
    logo: {
      background: "linear-gradient(135deg, #7c6fcd, #a78bfa)",
      borderRadius: "8px",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "14px",
      color: "#fff",
    },
    appName: { fontWeight: "700", fontSize: "16px" },
    tagline: { fontSize: "11px", color: "#666" },
    statusCard: {
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "10px",
    },
    statusRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
    dot: (ok) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: ok ? "#4ade80" : "#f87171",
    }),
    hint: {
      fontSize: "12px",
      color: "#555",
      lineHeight: "1.5",
      marginTop: "8px",
    },
    link: {
      color: "#7c6fcd",
      textDecoration: "underline",
      cursor: "pointer",
    },
    logoutBtn: {
      width: "100%",
      padding: "8px",
      background: "#2a1a1a",
      border: "1px solid #f87171",
      color: "#f87171",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      marginTop: "8px",
    },
    successMsg: { color: "#4ade80", fontSize: "12px", marginTop: "8px" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>Q</div>
        <div>
          <div style={styles.appName}>QuickAi</div>
          <div style={styles.tagline}>YouTube Study Assistant</div>
        </div>
      </div>

      {loading ? (
        <div style={{ ...styles.hint, color: "#555" }}>Checking authentication...</div>
      ) : (
        <>
          <div style={styles.statusCard}>
            <div style={styles.statusRow}>
              <div style={styles.dot(authenticated)} />
              <span>{authenticated ? "Authenticated ✓" : "Not logged in"}</span>
            </div>
            {!authenticated && (
              <div style={styles.hint}>
                Open the{" "}
                <span
                  style={styles.link}
                  onClick={() => chrome.tabs.create({ url: "http://localhost:5173" })}
                >
                  QuickAi web app
                </span>{" "}
                and log in. Your session will sync here automatically.
              </div>
            )}
          </div>

          {authenticated && (
            <>
              <div style={styles.hint}>
                Go to any YouTube video and the QuickAi panel will appear in the sidebar
                automatically.
              </div>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Disconnect Session
              </button>
              {cleared && <div style={styles.successMsg}>Session cleared. Log in again to reconnect.</div>}
            </>
          )}
        </>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("popup-root"));
root.render(<Popup />);