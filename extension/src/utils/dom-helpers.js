// YouTube transcript extraction utilities

export const findTranscriptButton = () => {
  console.log('Looking for transcript button...');
  
  // Try specific selectors that YouTube uses
  const selectors = [
    'button[aria-label="Show transcript"]',
    'button[aria-label="Transcript"]',
    '#primary-button yt-button-shape button',
    'ytd-video-secondary-info-renderer button',
    '#above-the-fold yt-button-shape button'
  ];
  
  for (const selector of selectors) {
    try {
      const button = document.querySelector(selector);
      if (button) {
        const text = button.innerText.toLowerCase();
        if (text.includes('transcript') || text.includes('show transcript')) {
          console.log('Found transcript button with selector:', selector);
          return button;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Fallback: look for any button with transcript text
  try {
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const text = button.innerText.toLowerCase();
      if (text.includes('transcript') || text.includes('show transcript')) {
        console.log('Found transcript button by text content');
        return button;
      }
    }
  } catch (e) {
    console.error('Error finding transcript button:', e);
  }
  
  console.log('No transcript button found');
  return null;
};

export const expandTranscriptPanel = () => {
  try {
    // Sometimes transcript is in a collapsed panel
    const expandButtons = document.querySelectorAll('#expand-button, #more-button, yt-button-shape button');
    for (const button of expandButtons) {
      if (button.innerText.includes('more') || button.innerText.includes('More')) {
        button.click();
        console.log('Expanded panel');
        return true;
      }
    }
  } catch (error) {
    console.error('Error expanding transcript panel:', error);
  }
  return false;
};

// Wait for transcript segments to load
const waitForSegments = async (timeout = 10000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer, .segment, #segments-container ytd-transcript-segment-renderer, ytd-transcript-body-renderer ytd-transcript-segment-renderer');
    
    if (segments.length > 0) {
      console.log(`Found ${segments.length} segments after waiting`);
      return segments;
    }
    
    // Wait 500ms before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Timeout waiting for segments');
  return null;
};

export const extractTranscriptFromPage = async () => {
  try {
    console.log('Starting transcript extraction...');
    
    // First, try to find if transcript is already visible
    let segments = document.querySelectorAll('ytd-transcript-segment-renderer, .segment, #segments-container ytd-transcript-segment-renderer, ytd-transcript-body-renderer ytd-transcript-segment-renderer');
    
    if (segments.length === 0) {
      console.log('No visible transcript found, trying to open transcript panel');
      
      // Try to click the transcript button
      const transcriptBtn = findTranscriptButton();
      if (transcriptBtn) {
        console.log('Clicking transcript button');
        try {
          transcriptBtn.click();
          
          // Wait for transcript panel to open and load
          console.log('Waiting for transcript to load...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try to expand if needed
          expandTranscriptPanel();
          
          // Wait for segments to appear
          segments = await waitForSegments(8000);
          
        } catch (clickError) {
          console.error('Error clicking transcript button:', clickError);
        }
      }
    }
    
    if (!segments || segments.length === 0) {
      console.log('No segments found after all attempts');
      return null;
    }
    
    console.log(`Found ${segments.length} transcript segments`);
    
    // Extract and combine text
    const transcriptTexts = [];
    
    for (let i = 0; i < segments.length; i++) {
      try {
        const segment = segments[i];
        // Try different possible text containers
        const textElement = segment.querySelector('.segment-text, yt-formatted-string, .text') || segment;
        let text = textElement.innerText || textElement.textContent;
        
        if (text) {
          // Remove timestamps (like "0:00" or "1:30")
          text = text.replace(/^\d+:\d+\s*/, '').trim();
          if (text.length > 0) {
            transcriptTexts.push(text);
          }
        }
      } catch (e) {
        console.error('Error extracting segment text:', e);
      }
    }
    
    if (transcriptTexts.length === 0) {
      console.log('Extracted transcript is empty');
      return null;
    }
    
    const transcript = transcriptTexts.join(' ');
    
    console.log(`Successfully extracted transcript: ${transcript.length} characters`);
    console.log('Preview:', transcript.substring(0, 200));
    
    return transcript;
    
  } catch (error) {
    console.error('Error extracting transcript:', error);
    return null;
  }
};

// Alternative method using YouTube's internal data
export const fetchTranscriptFromVideoId = async (videoId) => {
  try {
    console.log('Fetching transcript from backend for video:', videoId);
    
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          type: 'API_REQUEST',
          endpoint: `/youtube/transcript/${videoId}`,
          method: 'GET'
        }, (response) => {
          // Check for runtime error
          if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (response && response.success) {
            console.log('Got transcript from backend');
            resolve(response.transcript);
          } else {
            console.error('Backend transcript fetch failed:', response);
            reject(new Error(response?.message || 'Failed to fetch transcript'));
          }
        });
      } catch (sendError) {
        console.error('Error sending message:', sendError);
        reject(sendError);
      }
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
};

// Alternative method using YouTube's internal API (if available)
export const fetchTranscriptViaAPI = async (videoId) => {
  try {
    // This uses YouTube's internal API if accessible
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.events) {
        const transcript = data.events
          .map(event => event.segs ? event.segs.map(seg => seg.utf8).join(' ') : '')
          .join(' ');
        return transcript;
      }
    }
  } catch (error) {
    console.error('Error fetching via API:', error);
  }
  return null;
};

export const getVideoId = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  } catch (error) {
    console.error('Error getting video ID:', error);
    return null;
  }
};

export const getVideoTitle = () => {
  try {
    const titleElement = document.querySelector('h1 yt-formatted-string, h1.title, #title h1');
    return titleElement ? titleElement.innerText : 'YouTube Video';
  } catch (error) {
    console.error('Error getting video title:', error);
    return 'YouTube Video';
  }
};

export const injectStyles = () => {
  try {
    // Check if styles already injected
    if (document.getElementById('quickai-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'quickai-styles';
    style.textContent = `
      .quickai-chat-container {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .quickai-chat-header {
        background: #4f46e5;
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .quickai-chat-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .quickai-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0 5px;
      }
      
      .quickai-close-btn:hover {
        opacity: 0.8;
      }
      
      .quickai-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background: #f9fafb;
      }
      
      .quickai-message {
        margin-bottom: 15px;
        display: flex;
      }
      
      .quickai-message.user {
        justify-content: flex-end;
      }
      
      .quickai-message.model {
        justify-content: flex-start;
      }
      
      .quickai-message-content {
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 15px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .quickai-message.user .quickai-message-content {
        background: #4f46e5;
        color: white;
        border-bottom-right-radius: 5px;
      }
      
      .quickai-message.model .quickai-message-content {
        background: #e5e7eb;
        color: #1f2937;
        border-bottom-left-radius: 5px;
      }
      
      .quickai-chat-input {
        padding: 15px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 10px;
        background: white;
      }
      
      .quickai-chat-input input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
      }
      
      .quickai-chat-input input:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
      }
      
      .quickai-chat-input button {
        padding: 10px 20px;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .quickai-chat-input button:hover {
        background: #4338ca;
      }
      
      .quickai-chat-input button:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      
      .quickai-loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .quickai-button-overlay {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9998;
      }
      
      .quickai-action-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .quickai-action-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
      }
      
      .quickai-action-btn:hover::after {
        content: attr(title);
        position: absolute;
        right: 60px;
        background: #1f2937;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
      }
      
      .quickai-action-btn.summarize {
        background: #10b981;
        color: white;
      }
      
      .quickai-action-btn.chat {
        background: #4f46e5;
        color: white;
      }
      
      .quickai-action-btn.notes {
        background: #f59e0b;
        color: white;
      }
      
      .quickai-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .quickai-notification.success { background: #10b981; }
      .quickai-notification.error { background: #ef4444; }
      .quickai-notification.loading { background: #3b82f6; }
      .quickai-notification.info { background: #6b7280; }
      
      .quickai-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 90%;
        max-height: 80vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -45%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      
      .quickai-modal-header {
        background: #4f46e5;
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .quickai-modal-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .quickai-modal-content {
        padding: 20px;
        overflow-y: auto;
        max-height: 60vh;
        font-size: 14px;
        line-height: 1.6;
      }
      
      .quickai-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
      }
      
      .quickai-modal-close:hover {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
    console.log('Styles injected');
  } catch (error) {
    console.error('Error injecting styles:', error);
  }
};