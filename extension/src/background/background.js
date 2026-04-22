// Background service worker for handling authentication and API calls

let authToken = null;
let keepAliveInterval = null;

// Initialize
initialize();

function initialize() {
  console.log('🔵 Background script initialized');
  
  // Load token from storage
  chrome.storage.local.get(['authToken'], (result) => {
    if (result.authToken) {
      authToken = result.authToken;
      console.log('Token loaded from storage');
    }
  });
  
  // Set up keep-alive to prevent service worker from sleeping
  startKeepAlive();
}

function startKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  keepAliveInterval = setInterval(() => {
    console.log('Keep-alive ping');
    // Simple operation to keep service worker alive
    chrome.storage.local.get(['authToken'], () => {});
  }, 20000); // Ping every 20 seconds
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request.type);
  
  // Reset keep-alive on message
  startKeepAlive();
  
  switch (request.type) {
    case 'SET_TOKEN':
      handleSetToken(request, sendResponse);
      break;
      
    case 'GET_TOKEN':
      handleGetToken(sendResponse);
      break;
      
    case 'CLEAR_TOKEN':
      handleClearToken(sendResponse);
      break;
      
    case 'API_REQUEST':
      handleAPIRequest(request)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ 
          success: false, 
          message: error.message || 'API request failed'
        }));
      return true; // Keep message channel open
      
    case 'OPEN_POPUP':
      chrome.action.openPopup();
      sendResponse({ success: true });
      break;
      
    case 'PING':
      sendResponse({ success: true, timestamp: Date.now() });
      break;
      
    default:
      sendResponse({ error: 'Unknown request type' });
  }
  
  return true;
});

function handleSetToken(request, sendResponse) {
  authToken = request.token;
  chrome.storage.local.set({ authToken: request.token }, () => {
    console.log('Token saved to storage');
    sendResponse({ success: true });
  });
}

function handleGetToken(sendResponse) {
  chrome.storage.local.get(['authToken'], (result) => {
    authToken = result.authToken || null;
    console.log('Token retrieved:', authToken ? 'Present' : 'Not found');
    sendResponse({ token: authToken });
  });
}

function handleClearToken(sendResponse) {
  authToken = null;
  chrome.storage.local.remove('authToken', () => {
    console.log('Token cleared');
    sendResponse({ success: true });
  });
}

async function handleAPIRequest(request) {
  const { endpoint, method = 'POST', data } = request;
  
  // Format endpoint
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseURL = 'http://localhost:5000/api';
  const url = `${baseURL}${formattedEndpoint}`;
  
  console.log('Making API request to:', url);
  console.log('Method:', method);
  console.log('Token present:', !!authToken);
  
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    console.log('Response status:', response.status);
    
    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { message: 'Invalid JSON response' };
    }
    
    console.log('Response data:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true, ...result };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Show welcome page
    chrome.tabs.create({ 
      url: 'https://github.com/your-repo/quickai'
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up');
  initialize();
});

// Clean up on unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending');
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
});