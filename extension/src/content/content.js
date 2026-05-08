import { 
  extractTranscriptFromPage, 
  fetchTranscriptFromVideoId,
  getVideoId, 
  getVideoTitle,
  injectStyles 
} from '../utils/dom-helpers.js';
import { marked } from 'marked';

// ==========================================
// 1. THE MERMAID.INK RENDERER (Bulletproof Image API)
// ==========================================
const renderer = new marked.Renderer();
const originalCode = renderer.code.bind(renderer);

renderer.code = function(code, language, isEscaped) {
  if (language === 'mermaid') {
    try {
      // Pack the code into a JSON object and Base64 encode it (Standard for Mermaid.ink)
      const jsonPayload = JSON.stringify({ code: code.trim(), mermaid: { theme: 'default' } });
      const base64Code = btoa(unescape(encodeURIComponent(jsonPayload)));
      const imgUrl = `https://mermaid.ink/img/${base64Code}`;
      
      return `<div class="quickai-diagram" style="text-align: center; margin: 15px 0;">
                <img src="${imgUrl}" alt="Mermaid Diagram" style="max-width: 100%; border-radius: 8px;" onerror="this.outerHTML='<div style=\\'padding:10px;color:#ef4444;border:1px solid #ef4444;border-radius:8px;\\'>Diagram is too complex to render.</div>'"/>
              </div>`;
    } catch (err) {
      console.error('Failed to encode diagram:', err);
      return `<pre><code>${code}</code></pre>`;
    }
  }
  return originalCode(code, language, isEscaped);
};
marked.use({ renderer });

// Pre-processor to clean up AI math formulas and naked diagrams
function formatAIResponse(text) {
  if (!text) return '';
  let processed = text;

  // Clean LaTeX math symbols ($S1$ -> S1, $10^5$ -> 10^5)
  processed = processed.replace(/\$\$(.*?)\$\$/g, '$1').replace(/\$(.*?)\$/g, '$1');
  
  // Fix "Naked" Mermaid Diagrams if Gemini forgot the ```mermaid backticks
  processed = processed.replace(/(?:^|\n)(graph (?:TD|LR|TB|RL)[\s\S]*?)(?=\n\n|$)/g, (match, graphCode) => {
    if (match.includes('```')) return match;
    return `\n\`\`\`mermaid\n${graphCode.trim()}\n\`\`\`\n`;
  });
  
  // Parse the cleaned text into HTML using marked and our custom renderer
  return marked.parse(processed);
}
// ==========================================

// State management
let isExtensionAvailable = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Initialize when page loads
initialize();

async function initialize() {
  console.log('🔵 QuickAI content script loaded');
  console.log('Current URL:', window.location.href);
  console.log('Is YouTube video:', window.location.href.includes('youtube.com/watch'));
  
  // Check if extension context is valid
  checkExtensionContext();
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupExtension);
  } else {
    setupExtension();
  }
  
  // Set up periodic context check
  setInterval(checkExtensionContext, 30000); // Check every 30 seconds
}

function checkExtensionContext() {
  try {
    // Try to access chrome.runtime to check if context is valid
    if (chrome.runtime && chrome.runtime.id) {
      if (!isExtensionAvailable) {
        console.log('Extension context restored');
        isExtensionAvailable = true;
        // Re-initialize features
        setupExtension();
      }
    } else {
      throw new Error('Extension context invalid');
    }
  } catch (error) {
    if (isExtensionAvailable) {
      console.error('Extension context lost:', error.message);
      isExtensionAvailable = false;
      showExtensionReloadNotification();
    }
  }
}

function showExtensionReloadNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10001;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Extension Error</div>
    <div style="margin-bottom: 10px;">Extension context lost. Please reload the extension.</div>
    <button id="reload-extension" style="
      background: white;
      color: #ef4444;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">Reload Extension</button>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('reload-extension').addEventListener('click', () => {
    chrome.runtime.reload();
  });
}

function safeSendMessage(message, callback) {
  if (!isExtensionAvailable) {
    console.error('Extension not available');
    callback({ error: 'Extension context invalid' });
    return;
  }
  
  try {
    chrome.runtime.sendMessage(message, (response) => {
      // Check for runtime error
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        isExtensionAvailable = false;
        callback({ error: chrome.runtime.lastError.message });
      } else {
        callback(response);
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    isExtensionAvailable = false;
    callback({ error: error.message });
  }
}

function setupExtension() {
  if (!isExtensionAvailable) {
    console.log('Extension not available, skipping setup');
    return;
  }
  
  // Only run on YouTube video pages
  if (!window.location.href.includes('youtube.com/watch')) {
    console.log('Not a YouTube video page, exiting');
    return;
  }
  
  console.log('Setting up QuickAI extension...');
  
  // Inject styles
  injectStyles();
  
  // Create action buttons
  createActionButtons();
  
  // Check if user is logged in
  checkAuthStatus();
}

function createActionButtons() {
  // Remove existing buttons if any
  const existingButtons = document.querySelector('.quickai-button-overlay');
  if (existingButtons) {
    existingButtons.remove();
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'quickai-button-overlay';
  
  // Summarize button
  const summarizeBtn = document.createElement('button');
  summarizeBtn.className = 'quickai-action-btn summarize';
  summarizeBtn.innerHTML = '📝';
  summarizeBtn.title = 'Summarize Video';
  summarizeBtn.onclick = () => handleSummarize();
  
  // Chat button
  const chatBtn = document.createElement('button');
  chatBtn.className = 'quickai-action-btn chat';
  chatBtn.innerHTML = '💬';
  chatBtn.title = 'Chat with Video';
  chatBtn.onclick = () => toggleChat();
  
  // Detailed Notes button
  const notesBtn = document.createElement('button');
  notesBtn.className = 'quickai-action-btn notes';
  notesBtn.innerHTML = '📚';
  notesBtn.title = 'Generate Detailed Notes';
  notesBtn.onclick = () => handleDetailedNotes();
  
  overlay.appendChild(summarizeBtn);
  overlay.appendChild(chatBtn);
  overlay.appendChild(notesBtn);
  
  document.body.appendChild(overlay);
  console.log('QuickAI buttons created');
}

let chatContainer = null;

function toggleChat() {
  if (chatContainer) {
    chatContainer.remove();
    chatContainer = null;
  } else {
    createChatInterface();
  }
}

function createChatInterface() {
  chatContainer = document.createElement('div');
  chatContainer.className = 'quickai-chat-container';
  
  chatContainer.innerHTML = `
    <div class="quickai-chat-header">
      <h3>QuickAI Chat</h3>
      <button class="quickai-close-btn" onclick="this.closest('.quickai-chat-container').remove()">×</button>
    </div>
    <div class="quickai-chat-messages" id="quickai-messages">
      <div class="quickai-message model">
        <div class="quickai-message-content">
          Hello! Ask me anything about this video.
        </div>
      </div>
    </div>
    <div class="quickai-chat-input">
      <input type="text" id="quickai-user-input" placeholder="Type your question..." />
      <button id="quickai-send-btn">Send</button>
    </div>
  `;
  
  document.body.appendChild(chatContainer);
  
  // Add event listeners
  const input = document.getElementById('quickai-user-input');
  const sendBtn = document.getElementById('quickai-send-btn');
  
  sendBtn.onclick = () => sendMessage();
  input.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

async function sendMessage() {
  if (!isExtensionAvailable) {
    showNotification('Extension not available. Please reload.', 'error');
    return;
  }
  
  const input = document.getElementById('quickai-user-input');
  const messagesDiv = document.getElementById('quickai-messages');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  messagesDiv.innerHTML += `
    <div class="quickai-message user">
      <div class="quickai-message-content">${escapeHtml(message)}</div>
    </div>
  `;
  
  input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Show loading
  messagesDiv.innerHTML += `
    <div class="quickai-message model">
      <div class="quickai-message-content">
        <div class="quickai-loading"></div>
      </div>
    </div>
  `;
  
  try {
    const videoId = getVideoId();
    const title = getVideoTitle(); 
    const videoUrl = window.location.href; 
    
    // Try to get transcript from page first
    let transcript = await extractTranscriptFromPage();
    
    // If page extraction fails, try backend
    if (!transcript) {
      console.log('Page extraction failed, trying backend...');
      showNotification('Fetching transcript from server...', 'loading');
      transcript = await fetchTranscriptFromVideoId(videoId);
    }
    
    if (!transcript) {
      throw new Error('Could not extract transcript from this video');
    }
    
    safeSendMessage({
      type: 'API_REQUEST',
      endpoint: '/youtube/chat',
      data: {
        videoId,
        videoUrl,    
        title,       
        message,
        transcript
      }
    }, (response) => {
      // Remove loading message
      if (messagesDiv.lastElementChild) {
        messagesDiv.lastElementChild.remove();
      }
      
      if (response && response.success) {
      messagesDiv.innerHTML += `
          <div class="quickai-message model">
            <div class="quickai-message-content quickai-markdown">${formatAIResponse(response.response || response.message)}</div>
          </div>
        `;
      } else {
        messagesDiv.innerHTML += `
          <div class="quickai-message model">
            <div class="quickai-message-content" style="color: #dc2626;">
              Error: ${response?.message || response?.error || 'Failed to get response'}
            </div>
          </div>
        `;
      }
      
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  } catch (error) {
    if (messagesDiv.lastElementChild) {
      messagesDiv.lastElementChild.remove();
    }
    messagesDiv.innerHTML += `
      <div class="quickai-message model">
        <div class="quickai-message-content" style="color: #dc2626;">
          Error: ${escapeHtml(error.message)}
        </div>
      </div>
    `;
  }
}

async function handleSummarize() {
  if (!isExtensionAvailable) {
    showNotification('Extension not available. Please reload.', 'error');
    return;
  }
  
  try {
    console.log('Starting summarize...');
    
    const videoId = getVideoId();
    const title = getVideoTitle();
    
    console.log('Video ID:', videoId);
    console.log('Video Title:', title);
    
    // Show loading notification
    showNotification('Extracting transcript...', 'loading');
    
    // Extract transcript
    let transcript = await extractTranscriptFromPage();
    
    if (!transcript) {
      console.log('Transcript extraction failed, trying backend...');
      showNotification('Fetching transcript from server...', 'loading');
      
      // Try backend as fallback
      try {
        transcript = await fetchTranscriptFromVideoId(videoId);
      } catch (e) {
        console.error('Backend transcript fetch failed:', e);
      }
    }
    
    if (!transcript) {
      showNotification('Could not extract transcript from this video.', 'error');
      return;
    }
    
    processSummary(videoId, title, transcript);
    
  } catch (error) {
    console.error('Summarize error:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}

function processSummary(videoId, title, transcript) {
  console.log('Processing summary...');
  showNotification('Generating summary...', 'loading');
  
  safeSendMessage({
    type: 'API_REQUEST',
    endpoint: '/youtube/summarize',
    data: {
      videoUrl: window.location.href,
      title: title,
      transcript: transcript
    }
  }, (response) => {
    console.log('Summary response:', response);
    
    if (response && response.success) {
      showNotification('Summary generated successfully!', 'success');
      
      if (response.summary) {
        showSummaryModal(formatAIResponse(response.summary), 'Video Summary');
      }
    } else {
      showNotification('Failed to generate summary: ' + (response?.message || response?.error || 'Unknown error'), 'error');
    }
  });
}

async function handleDetailedNotes() {
  if (!isExtensionAvailable) {
    showNotification('Extension not available. Please reload.', 'error');
    return;
  }
  
  try {
    console.log('Starting detailed notes generation...');
    
    const videoId = getVideoId();
    const title = getVideoTitle();
    
    showNotification('Extracting transcript...', 'loading');
    
    let transcript = await extractTranscriptFromPage();
    
    if (!transcript) {
      console.log('Transcript extraction failed, trying backend...');
      showNotification('Fetching transcript from server...', 'loading');
      
      try {
        transcript = await fetchTranscriptFromVideoId(videoId);
      } catch (e) {
        console.error('Backend transcript fetch failed:', e);
      }
    }
    
    if (!transcript) {
      showNotification('Could not extract transcript from this video.', 'error');
      return;
    }
    
    showNotification('Generating detailed notes (this may take a few minutes)...', 'loading');
    
    safeSendMessage({
      type: 'API_REQUEST',
      endpoint: '/youtube/detailed-notes',
      data: {
        videoUrl: window.location.href,
        title: title,
        transcript: transcript
      }
    }, (response) => {
      console.log('Detailed notes response:', response);
      
      if (response && response.success) {
        showNotification('Notes generated successfully!', 'success');
        
        if (response.notes) {
          showSummaryModal(formatAIResponse(response.notes), 'Detailed Notes');
        }
      } else {
        showNotification('Failed to generate notes: ' + (response?.message || response?.error || 'Unknown error'), 'error');
      }
    });
  } catch (error) {
    console.error('Detailed notes error:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}

function showNotification(message, type = 'info') {
  console.log(`Notification (${type}):`, message);
  
  // Remove existing notification
  const existing = document.getElementById('quickai-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'quickai-notification';
  notification.className = `quickai-notification ${type}`;
  
  let spinner = '';
  if (type === 'loading') {
    spinner = '<div class="quickai-loading" style="margin-right: 8px;"></div>';
  }
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      ${spinner}
      <span>${escapeHtml(message)}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds for non-loading messages
  if (type !== 'loading') {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }
}

function showSummaryModal(content, title = 'Video Summary') {
  // Remove existing modal if any
  const existingModal = document.getElementById('quickai-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.id = 'quickai-modal';
  modal.className = 'quickai-modal';
  
  modal.innerHTML = `
    <div class="quickai-modal-header">
      <h3 style="margin: 0; font-size: 16px;">${escapeHtml(title)}</h3>
      <button class="quickai-modal-close" id="close-modal">×</button>
    </div>
    <div class="quickai-modal-content">
      <div class="quickai-markdown">${content}</div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('close-modal').addEventListener('click', () => {
    modal.remove();
  });
  
  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function checkAuthStatus() {
  if (!isExtensionAvailable) return;
  
  safeSendMessage({ type: 'GET_TOKEN' }, (response) => {
    if (!response || !response.token) {
      // Show login reminder
      const reminder = document.createElement('div');
      reminder.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4f46e5;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        cursor: pointer;
        font-size: 13px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      reminder.innerHTML = '⚠️ Please login to QuickAI to use features';
      reminder.onclick = () => {
        safeSendMessage({ type: 'OPEN_POPUP' }, () => {});
      };
      document.body.appendChild(reminder);
      
      setTimeout(() => {
        if (reminder.parentNode) {
          reminder.style.opacity = '0';
          setTimeout(() => reminder.remove(), 300);
        }
      }, 5000);
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content received message:', request.type);
  
  if (!isExtensionAvailable) {
    sendResponse({ error: 'Extension context invalid' });
    return true;
  }
  
  switch (request.type) {
    case 'TOGGLE_CHAT':
      toggleChat();
      sendResponse({ success: true });
      break;
    case 'SUMMARIZE_VIDEO':
      handleSummarize();
      sendResponse({ success: true });
      break;
    case 'GENERATE_NOTES':
      handleDetailedNotes();
      sendResponse({ success: true });
      break;
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true;
});

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Handle page navigation (for Single Page Applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    // Re-initialize on URL change
    setTimeout(() => {
      setupExtension();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });


