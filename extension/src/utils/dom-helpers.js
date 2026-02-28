// dom-helpers.js — Utilities for locating YouTube DOM elements

/**
 * Waits for a selector to appear in the DOM with a configurable timeout.
 */
export function waitForElement(selector, timeout = 8000) {
  return new Promise((resolve, reject) => {
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
      reject(new Error(`Timeout: element "${selector}" not found after ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Returns true if the current page is a YouTube video watch page.
 */
export function isYouTubeWatchPage() {
  return window.location.hostname.includes("youtube.com") &&
    window.location.pathname === "/watch";
}

/**
 * Simple sleep utility.
 */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}