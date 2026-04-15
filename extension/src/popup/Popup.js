// Simple popup script without React
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  // Check if user is logged in
  chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, async (response) => {
    console.log('Token check response:', response);
    
    if (response && response.token) {
      // User is logged in
      showLoggedInUI(root, response.token);
    } else {
      // Show login form
      showLoginForm(root);
    }
  });
  
  // Get current video info
  getCurrentVideoInfo();
});

// Show login form
function showLoginForm(root) {
  root.innerHTML = `
    <div class="header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
      <div class="logo" style="width: 32px; height: 32px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Q</div>
      <div class="title" style="font-size: 18px; font-weight: 600; color: #1f2937;">QuickAI</div>
    </div>
    
    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin-bottom: 15px; font-size: 16px;">Login to QuickAI</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #4b5563;">Email</label>
        <input type="email" id="login-email" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Enter your email">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #4b5563;">Password</label>
        <input type="password" id="login-password" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Enter your password">
      </div>
      
      <div id="login-error" style="color: #dc2626; font-size: 12px; margin-bottom: 10px; display: none;"></div>
      
      <button id="login-btn" style="width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Login</button>
      
      <div style="margin-top: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        Don't have an account? 
        <a href="#" id="show-register" style="color: #4f46e5; text-decoration: none;">Register</a>
      </div>
    </div>
    
    <div id="video-info" class="video-info" style="background: white; border-radius: 12px; padding: 12px; font-size: 13px; border: 1px solid #e5e7eb;">
      Loading video info...
    </div>
  `;
  
  // Load video info
  getCurrentVideoInfo().then(video => {
    const videoInfo = document.getElementById('video-info');
    if (video) {
      videoInfo.innerHTML = `
        <div class="video-title" style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${video.title}</div>
        <div class="video-url" style="color: #6b7280; font-size: 11px;">YouTube Video</div>
      `;
    } else {
      videoInfo.innerHTML = 'Not on a YouTube video page';
    }
  });
  
  // Add login handler
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm(root);
  });
}

// Show register form
function showRegisterForm(root) {
  root.innerHTML = `
    <div class="header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
      <div class="logo" style="width: 32px; height: 32px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Q</div>
      <div class="title" style="font-size: 18px; font-weight: 600; color: #1f2937;">QuickAI</div>
    </div>
    
    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin-bottom: 15px; font-size: 16px;">Create Account</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #4b5563;">Name</label>
        <input type="text" id="register-name" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Enter your name">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #4b5563;">Email</label>
        <input type="email" id="register-email" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Enter your email">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #4b5563;">Password</label>
        <input type="password" id="register-password" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Enter your password">
      </div>
      
      <div id="register-error" style="color: #dc2626; font-size: 12px; margin-bottom: 10px; display: none;"></div>
      
      <button id="register-btn" style="width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Register</button>
      
      <div style="margin-top: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        Already have an account? 
        <a href="#" id="show-login" style="color: #4f46e5; text-decoration: none;">Login</a>
      </div>
    </div>
  `;
  
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm(root);
  });
}

// Handle login
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  if (!email || !password) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please enter both email and password';
    return;
  }
  
  errorDiv.style.display = 'none';
  
  // Disable button and show loading
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  
  try {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      endpoint: '/auth/login',
      method: 'POST',
      data: { email, password }
    }, (response) => {
      console.log('Login response:', response);
      
      if (response && response.success) {
        // Save token
        chrome.runtime.sendMessage({
          type: 'SET_TOKEN',
          token: response.token
        }, () => {
          // Reload popup to show logged in UI
          location.reload();
        });
      } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = response?.message || 'Login failed';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    });
  } catch (error) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = error.message;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
}

// Handle register
async function handleRegister() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorDiv = document.getElementById('register-error');
  
  if (!name || !email || !password) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please fill in all fields';
    return;
  }
  
  if (password.length < 6) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Password must be at least 6 characters';
    return;
  }
  
  errorDiv.style.display = 'none';
  
  const registerBtn = document.getElementById('register-btn');
  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating account...';
  
  try {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      endpoint: '/auth/register',
      method: 'POST',
      data: { name, email, password }
    }, (response) => {
      console.log('Register response:', response);
      
      if (response && response.success) {
        // Save token
        chrome.runtime.sendMessage({
          type: 'SET_TOKEN',
          token: response.token
        }, () => {
          // Reload popup to show logged in UI
          location.reload();
        });
      } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = response?.message || 'Registration failed';
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
      }
    });
  } catch (error) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = error.message;
    registerBtn.disabled = false;
    registerBtn.textContent = 'Register';
  }
}

async function getCurrentVideoInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      return null;
    }
    
    if (tab.url.includes('youtube.com/watch')) {
      const url = new URL(tab.url);
      const videoId = url.searchParams.get('v');
      const title = tab.title ? tab.title.replace(' - YouTube', '') : 'YouTube Video';
      
      return {
        id: videoId,
        url: tab.url,
        title: title
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
}

function showLoggedInUI(root, token) {
  // Fetch user info
  chrome.runtime.sendMessage({
    type: 'API_REQUEST',
    endpoint: '/auth/me',
    method: 'GET'
  }, (response) => {
    if (response && response.success) {
      renderUserDashboard(root, response.user);
    } else {
      // If can't get user info, show login form
      showLoginForm(root);
    }
  });
}

function renderUserDashboard(root, user) {
  root.innerHTML = `
    <div class="header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
      <div class="logo" style="width: 32px; height: 32px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Q</div>
      <div class="title" style="font-size: 18px; font-weight: 600; color: #1f2937;">QuickAI</div>
    </div>
    
    <div class="user-card" style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <div style="font-weight: 600; margin-bottom: 4px;">${user.name || 'User'}</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${user.email || ''}</div>
      <span style="display: inline-block; padding: 4px 8px; background: #4f46e5; color: white; border-radius: 16px; font-size: 11px;">${user.plan || 'free'}</span>
    </div>
    
    <div id="video-info" style="background: white; border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 13px; border: 1px solid #e5e7eb;">
      Loading video info...
    </div>
    
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <button id="summarizeBtn" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #10b981; color: white; cursor: pointer;">📝 Summarize</button>
      <button id="chatBtn" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #4f46e5; color: white; cursor: pointer;">💬 Chat</button>
      <button id="notesBtn" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #f59e0b; color: white; cursor: pointer;">📚 Notes</button>
    </div>
    
    <div style="background: white; border-radius: 12px; padding: 12px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Recent Sessions</div>
      <div id="recent-sessions">
        <div style="text-align: center; padding: 20px; color: #6b7280;">Loading...</div>
      </div>
    </div>
    
    <button id="logoutBtn" style="width: 100%; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 12px;">Logout</button>
  `;
  
  // Load video info
  getCurrentVideoInfo().then(video => {
    const videoInfo = document.getElementById('video-info');
    if (video) {
      videoInfo.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">${video.title}</div>
        <div style="color: #6b7280; font-size: 11px;">YouTube Video</div>
      `;
    } else {
      videoInfo.innerHTML = 'Not on a YouTube video page';
    }
  });
  
  // Load recent sessions
  chrome.runtime.sendMessage({
    type: 'API_REQUEST',
    endpoint: '/youtube/recent-sessions',
    method: 'GET'
  }, (response) => {
    const sessionsDiv = document.getElementById('recent-sessions');
    
    if (response && response.success && response.sessions?.length > 0) {
      sessionsDiv.innerHTML = response.sessions.map(session => `
        <div class="session-item" data-session-id="${session._id}" style="padding: 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer;">
          <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">${session.title || 'Untitled'}</div>
          <div style="font-size: 11px; color: #9ca3af;">${new Date(session.createdAt).toLocaleDateString()}</div>
        </div>
      `).join('');
      
      document.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', () => {
          const sessionId = item.dataset.sessionId;
          alert(`Session ID: ${sessionId}\n(This would open the session in a new tab if you had a frontend)`);
        });
      });
    } else {
      sessionsDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #9ca3af;">No recent sessions</div>';
    }
  });
  
  // Add event listeners
  document.getElementById('summarizeBtn').addEventListener('click', handleSummarize);
  document.getElementById('chatBtn').addEventListener('click', handleChat);
  document.getElementById('notesBtn').addEventListener('click', handleDetailedNotes);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function handleSummarize() {
  getCurrentVideoInfo().then(video => {
    if (!video) {
      alert('Please navigate to a YouTube video');
      return;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SUMMARIZE_VIDEO',
        videoData: video
      });
    });
    
    window.close();
  });
}

function handleChat() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_CHAT' });
  });
  window.close();
}

function handleDetailedNotes() {
  getCurrentVideoInfo().then(video => {
    if (!video) {
      alert('Please navigate to a YouTube video');
      return;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'GENERATE_NOTES',
        videoData: video
      });
    });
    
    window.close();
  });
}

function handleLogout() {
  chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' }, () => {
    location.reload();
  });
}