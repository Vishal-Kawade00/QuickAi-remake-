// scraper.js — Extracts YouTube transcript and video metadata

/**
 * Gets the current video ID from the URL.
 */
export function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

/**
 * Gets the current video title from the DOM.
 */
export function getVideoTitle() {
  const titleEl =
    document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string") ||
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("#title h1 yt-formatted-string");
  return titleEl ? titleEl.innerText.trim() : "Untitled Video";
}

/**
 * Opens the transcript panel on YouTube and extracts all segments.
 * Returns an array of { text, start } objects.
 *
 * NOTE: YouTube's DOM changes frequently. This targets the 2024-era structure.
 */
export async function extractTranscript() {
  // 1. Try to open the transcript panel if not already open
  await openTranscriptPanel();

  // 2. Wait for transcript segments to load
  await waitForElement("ytd-transcript-segment-renderer");

  // 3. Scrape all segments
  const segments = document.querySelectorAll("ytd-transcript-segment-renderer");
  if (!segments.length) {
    throw new Error("No transcript segments found. This video may not have captions.");
  }

  const transcript = [];
  segments.forEach((seg) => {
    const timeEl = seg.querySelector(".segment-timestamp");
    const textEl = seg.querySelector(".segment-text");
    if (textEl) {
      transcript.push({
        start: timeEl ? timeEl.innerText.trim() : "",
        text: textEl.innerText.trim(),
      });
    }
  });

  return transcript;
}

/**
 * Returns the full transcript as a single string.
 */
export async function getFullTranscriptText() {
  const segments = await extractTranscript();
  return segments.map((s) => s.text).join(" ");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openTranscriptPanel() {
  // Check if already open
  const existing = document.querySelector("ytd-transcript-segment-renderer");
  if (existing) return;

  // Click the "..." more options button, then "Open transcript"
  const moreBtn = document.querySelector(
    "ytd-video-description-transcript-section-renderer button, #expand"
  );
  if (moreBtn) {
    moreBtn.click();
    await sleep(500);
  }

  // Find the "Show transcript" button
  const buttons = Array.from(document.querySelectorAll("button, yt-button-shape button"));
  const transcriptBtn = buttons.find(
    (btn) => btn.innerText && btn.innerText.toLowerCase().includes("transcript")
  );
  if (transcriptBtn) {
    transcriptBtn.click();
    await sleep(1000);
  }
}

function waitForElement(selector, timeout = 8000) {
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
      reject(new Error(`Timeout waiting for: ${selector}`));
    }, timeout);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}