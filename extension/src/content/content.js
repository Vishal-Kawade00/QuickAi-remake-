// content.js — Entry point for the content script
// Detects YouTube video pages and injects the QuickAi panel

import { injectPanel, removePanel } from "./ui-injector.jsx";

let currentUrl = window.location.href;

// ─── Initial injection ────────────────────────────────────────────────────────
if (window.location.href.includes("youtube.com/watch")) {
  // Small delay to ensure YouTube's SPA has rendered the sidebar
  setTimeout(() => injectPanel(), 1500);
}

// ─── Listen for JWT messages from the QuickAi React web app ──────────────────
// The web app does: window.postMessage({ type: 'QUICKAI_JWT', token: '...' })
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "QUICKAI_JWT" && event.data?.token) {
    chrome.runtime.sendMessage({
      type: "SAVE_JWT",
      token: event.data.token,
    });
    console.log("[QuickAi] JWT received and forwarded to background.");
  }
});

// ─── Handle YouTube SPA navigation (URL changes without full page reload) ────
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    removePanel();

    if (currentUrl.includes("youtube.com/watch")) {
      setTimeout(() => injectPanel(), 2000);
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});