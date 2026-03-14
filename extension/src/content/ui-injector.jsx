// ui-injector.js — Injects the QuickAi panel into YouTube's DOM

import React from "react";
import { createRoot } from "react-dom/client";
import QuickAiPanel from "./QuickAiPanel.jsx";

let injected = false;

/**
 * Injects the QuickAi panel beside the YouTube video player.
 * Waits for the secondary (sidebar) column to be available.
 */
export async function injectPanel() {
  if (injected) return;

  const target = await waitForElement("#secondary", 10000);
  if (!target) {
    console.error("[QuickAi] Could not find YouTube sidebar to inject panel.");
    return;
  }

  // Create a container div
  const container = document.createElement("div");
  container.id = "quickai-root";
  container.style.cssText = `
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 16px;
    font-family: sans-serif;
  `;

  // Prepend so it appears at the top of the sidebar
  target.prepend(container);

  // Mount React app into the container
  const root = createRoot(container);
  root.render(<QuickAiPanel />);

  injected = true;
  console.log("[QuickAi] Panel injected successfully.");
}

/**
 * Removes the injected panel (e.g., on navigation away).
 */
export function removePanel() {
  const el = document.getElementById("quickai-root");
  if (el) {
    el.remove();
    injected = false;
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function waitForElement(selector, timeout = 8000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}