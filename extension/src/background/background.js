// background.js — Service Worker
// Listens for JWT shared from the React web app and handles backend API calls

const API_BASE = "http://localhost:5000/api";

// ─── Listen for messages from content scripts and popup ───────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_JWT") {
    chrome.storage.local.set({ jwt: message.token }, () => {
      console.log("[QuickAi] JWT saved to extension storage.");
      sendResponse({ success: true });
    });
    return true; // keep channel open for async response
  }

  if (message.type === "GET_JWT") {
    chrome.storage.local.get(["jwt"], (result) => {
      sendResponse({ token: result.jwt || null });
    });
    return true;
  }

  if (message.type === "CLEAR_JWT") {
    chrome.storage.local.remove("jwt", () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // ─── API Calls ───────────────────────────────────────────────────────────────
  if (message.type === "API_SUMMARIZE") {
    handleApiCall("/youtube/summarize", message.payload, sendResponse);
    return true;
  }

  if (message.type === "API_DETAILED_NOTES") {
    handleApiCall("/youtube/detailed-notes", message.payload, sendResponse);
    return true;
  }

  if (message.type === "API_CHAT") {
    handleApiCall("/youtube/chat", message.payload, sendResponse);
    return true;
  }

  if (message.type === "API_GET_SESSION") {
    handleGetCall(`/youtube/session/${message.videoId}`, sendResponse);
    return true;
  }
});

// ─── Helper: POST request ─────────────────────────────────────────────────────
async function handleApiCall(endpoint, payload, sendResponse) {
  try {
    const { jwt } = await chrome.storage.local.get(["jwt"]);
    if (!jwt) {
      sendResponse({ error: "Not authenticated. Please log in on QuickAi." });
      return;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      sendResponse({ error: data.message || "Server error" });
    } else {
      sendResponse({ data });
    }
  } catch (err) {
    console.error("[QuickAi Background Error]", err);
    sendResponse({ error: "Network error. Is the server running?" });
  }
}

// ─── Helper: GET request ──────────────────────────────────────────────────────
async function handleGetCall(endpoint, sendResponse) {
  try {
    const { jwt } = await chrome.storage.local.get(["jwt"]);
    if (!jwt) {
      sendResponse({ error: "Not authenticated." });
      return;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const data = await res.json();
    sendResponse({ data });
  } catch (err) {
    sendResponse({ error: "Network error." });
  }
}

// ─── Cross-origin JWT sharing from React app ─────────────────────────────────
// The React app posts a message to the window; the content script relays it here.
// See: client/src/utils/shareJwt.js for the web app side.