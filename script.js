document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");
  
  const promptInput = document.getElementById('promptInput');
  const responseArea = document.getElementById('response');
  const moonIcon = document.querySelector('.moon-icon');
  
  // Check if elements exist
  console.log("Elements found:", { 
    promptInput: !!promptInput, 
    responseArea: !!responseArea, 
    moonIcon: !!moonIcon 
  });
  
  // Initialize the response area with empty content
  responseArea.innerHTML = '';
  
  // API key management and conversation state
  let apiKey = window.CONFIG?.OPENROUTER_API_KEY; // Directly use the API key from the configuration
  console.log("API Key from config:", apiKey);

  if (!apiKey) {
      showError("Please ensure your OpenRouter API key is set in the .env file.");
      return;
  }
  
  let conversationHistory = [];
  let conversationActive = false;
  
  // Create the settings UI
  const settingsButton = document.createElement('button');
  settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
  settingsButton.style.position = 'absolute';
  settingsButton.style.top = '20px';
  settingsButton.style.left = '20px';
  settingsButton.style.backgroundColor = 'transparent';
  settingsButton.style.border = 'none';
  settingsButton.style.color = '#9370db';
  settingsButton.style.fontSize = '1.2rem';
  settingsButton.style.cursor = 'pointer';
  document.querySelector('.container').appendChild(settingsButton);
  
  // Create a new conversation button
  const newConversationButton = document.createElement('button');
  newConversationButton.innerHTML = '<i class="fas fa-plus"></i>';
  newConversationButton.style.position = 'absolute';
  newConversationButton.style.top = '20px';
  newConversationButton.style.left = '60px';
  newConversationButton.style.backgroundColor = 'transparent';
  newConversationButton.style.border = 'none';
  newConversationButton.style.color = '#9370db';
  newConversationButton.style.fontSize = '1.2rem';
  newConversationButton.style.cursor = 'pointer';
  newConversationButton.title = 'New Conversation';
  document.querySelector('.container').appendChild(newConversationButton);
  
  // Create a conversation container to display previous messages
  const conversationContainer = document.createElement('div');
  conversationContainer.className = 'conversation-container';
  conversationContainer.style.marginBottom = '20px';
  conversationContainer.style.display = 'none';
  conversationContainer.style.width = '100%';
  conversationContainer.style.maxWidth = '700px';
  promptInput.parentNode.insertBefore(conversationContainer, promptInput);
  
  // Settings modal
  const settingsModal = document.createElement('div');
  settingsModal.style.display = 'none';
  settingsModal.style.position = 'fixed';
  settingsModal.style.top = '0';
  settingsModal.style.left = '0';
  settingsModal.style.width = '100%';
  settingsModal.style.height = '100%';
  settingsModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
  settingsModal.style.zIndex = '1000';
  settingsModal.style.justifyContent = 'center';
  settingsModal.style.alignItems = 'center';
  
  settingsModal.innerHTML = `
    <div style="background-color: #222; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px;">
      <h2 style="color: #fff; margin-top: 0;">Settings</h2>
      <div style="margin-bottom: 20px;">
        <label for="apiKeyInput" style="display: block; margin-bottom: 8px; color: #ddd;">OpenRouter API Key</label>
        <input type="password" id="apiKeyInput" style="width: 100%; padding: 8px; background-color: #333; border: 1px solid #444; color: #fff; border-radius: 4px;"
              value="${apiKey || ''}" readonly>
        <p style="color: #999; font-size: 0.8rem; margin-top: 5px;">Your API key is stored locally in your browser.</p>
        <p style="color: #999; font-size: 0.8rem; margin-top: 5px;">If you need to change it, please update the .env file.</p>
      </div>
      <div style="margin-bottom: 20px;">
        <label for="modelSelect" style="display: block; margin-bottom: 8px; color: #ddd;">LLM Model</label>
        <select id="modelSelect" style="width: 100%; padding: 8px; background-color: #333; border: 1px solid #444; color: #fff; border-radius: 4px;">
          <option value="perplexity/llama-3.1-sonar-small-128k-online">perplexity/llama-3.1-sonar-small-128k-online</option>
          <option value="anthropic/claude-3-opus:beta">anthropic/claude-3-opus:beta</option>
          <option value="anthropic/claude-3-sonnet:beta">anthropic/claude-3-sonnet:beta</option>
          <option value="anthropic/claude-3-haiku:beta">anthropic/claude-3-haiku:beta</option>
          <option value="google/gemini-pro">google/gemini-pro</option>
          <option value="meta/llama-3-70b-instruct">meta/llama-3-70b-instruct</option>
          <option value="meta/llama-3-8b-instruct">meta/llama-3-8b-instruct</option>
        </select>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button id="closeSettings" style="background-color: #9370db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Save & Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(settingsModal);
  
  // Model selection
  let selectedModel = localStorage.getItem('openrouter_model') || window.CONFIG?.DEFAULT_MODEL || 'perplexity/llama-3.1-sonar-small-128k-online';
  
  // Event handlers for settings
  settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    document.getElementById('apiKeyInput').value = apiKey || '';
    document.getElementById('modelSelect').value = selectedModel;
  });
  
  document.getElementById('closeSettings').addEventListener('click', () => {
    apiKey = document.getElementById('apiKeyInput').value.trim();
    selectedModel = document.getElementById('modelSelect').value;
    
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('openrouter_model', selectedModel);
    
    settingsModal.style.display = 'none';
  });
  
  // New conversation handler
  newConversationButton.addEventListener('click', () => {
    console.log("Starting new conversation");
    promptInput.value = '';
    conversationHistory = [];
    conversationActive = false;
    conversationContainer.style.display = 'none';
    conversationContainer.innerHTML = '';
    responseArea.innerHTML = '';
  });
  
  // Moon icon toggle (dark/light mode)
  moonIcon.addEventListener('click', () => {
    moonIcon.classList.toggle('active');
    console.log("Moon icon clicked");
  });
  
  // Create a simple search button
  const searchButton = document.createElement('button');
  searchButton.textContent = "Search";
  searchButton.style.marginTop = "10px";
  searchButton.style.padding = "8px 16px";
  searchButton.style.backgroundColor = "#9370db";
  searchButton.style.color = "white";
  searchButton.style.border = "none";
  searchButton.style.borderRadius = "4px";
  searchButton.style.cursor = "pointer";
  
  // Insert the button after the input
  promptInput.parentNode.insertBefore(searchButton, responseArea);
  console.log("Search button created and added to DOM");
  
  // Loading indicator
  function showLoading() {
    console.log("Showing loading indicator");
    responseArea.innerHTML = `
      <div style="display: flex; justify-content: center; margin: 20px 0;">
        <div style="width: 10px; height: 10px; background-color: #9370db; border-radius: 50%; margin: 0 5px; animation: pulse 1s infinite;"></div>
        <div style="width: 10px; height: 10px; background-color: #9370db; border-radius: 50%; margin: 0 5px; animation: pulse 1s infinite .2s;"></div>
        <div style="width: 10px; height: 10px; background-color: #9370db; border-radius: 50%; margin: 0 5px; animation: pulse 1s infinite .4s;"></div>
      </div>
      <p style="text-align: center;">Loading...</p>
    `;
  }
  
  // Function to handle API error messages
  function showError(message) {
    responseArea.innerHTML = `
      <div style="padding: 20px; margin-top: 20px; background-color: rgba(220, 53, 69, 0.2); border-radius: 5px; border-left: 4px solid #dc3545;">
        <h3 style="color: #dc3545; margin-top: 0;">Error</h3>
        <p>${message}</p>
      </div>
    `;
  }

  // Function to add a message to the conversation history UI
  function addMessageToConversation(role, content, isShort = false) {
    // Create and add message to the conversation container
    const messageElement = document.createElement('div');
    messageElement.className = `conversation-message ${role}`;
    messageElement.style.padding = '10px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.maxHeight = isShort ? 'auto' : '100px';
    messageElement.style.overflow = 'hidden';
    messageElement.style.textOverflow = 'ellipsis';
    messageElement.style.position = 'relative';
    
    if (role === 'user') {
      messageElement.style.backgroundColor = 'rgba(147, 112, 219, 0.2)';
      messageElement.style.borderLeft = '3px solid #9370db';
      messageElement.innerHTML = `<strong style="color: #9370db;">You:</strong> ${content}`;
    } else {
      messageElement.style.backgroundColor = 'rgba(60, 60, 60, 0.3)';
      messageElement.style.borderLeft = '3px solid #555';
      // Display only a portion of the assistant's response if it's long
      const displayContent = isShort ? content : content.slice(0, 150) + '...';
      messageElement.innerHTML = `<strong style="color: #aaa;">AI:</strong> ${displayContent}`;
    }
    
    conversationContainer.appendChild(messageElement);
    conversationContainer.style.display = 'block';
  }
  
  // Main search function
  async function handleSearch() {
    const query = promptInput.value.trim();
    console.log("Search button clicked, query:", query);
    
    if (!query) return;
    
    // Check if API key is set
    console.log("Current API Key:", apiKey);
    if (!apiKey) {
      showError("Please ensure your OpenRouter API key is set in the .env file.");
      return;
    }
    
    // If this is a follow-up question, show the conversation history
    if (conversationActive) {
      // Add the user query to conversation UI first
      addMessageToConversation('user', query, true);
    }
    
    // Add user query to conversation history
    conversationHistory.push({ role: "user", content: query });
    
    // Clear input field
    promptInput.value = '';
    
    // Show loading indicator
    showLoading();
    
    try {
      const response = await fetchOpenRouterResponse(query);
      displayResponse(query, response);
      
      // Mark conversation as active after first successful exchange
      conversationActive = true;
    } catch (error) {
      console.error("API error:", error);
      showError(error.message || "Failed to get a response. Please check your API key and try again.");
    }
  }
  
  // Function to call the OpenRouter API
  async function fetchOpenRouterResponse(query) {
    console.log(`Fetching response from OpenRouter using model: ${selectedModel}`);
    console.log("Conversation history:", conversationHistory);
    
    const requestData = {
      model: selectedModel,
      messages: conversationHistory,
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0
    };
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Function to format and display the response
  function displayResponse(query, apiResponse) {
    console.log("API response received:", apiResponse);
    
    // Extract the content from the API response
    const content = apiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      showError("Received an empty response from the API");
      return;
    }
    
    // Add the assistant's response to conversation history
    conversationHistory.push({ role: "assistant", content: content });
    
    // Add to conversation UI if this is a follow-up
    if (conversationActive && conversationHistory.length > 2) {
      addMessageToConversation('assistant', content);
    }
    
    // Format the content with Markdown
    const formattedContent = marked.parse(content);
    
    // Create the full HTML with a Perplexity-like UI
    const html = `
      <h1 style="margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; color: #fff; font-size: 1.8rem; border-bottom: 1px solid #333; padding-bottom: 0.3em;">${query}</h1>
      
      <div class="markdown-content">
        ${formattedContent}
      </div>
      
      <div class="source-section" style="margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <div style="background-color: #333; padding: 5px 10px; border-radius: 4px; margin-right: 10px;">
            <span style="color: #9370db; font-weight: bold;">${selectedModel.split('/')[0]}</span>
            <span style="color: #777; font-size: 0.9em;">/${selectedModel.split('/')[1]}</span>
          </div>
          <div style="color: #777; font-size: 0.9em;">
            via OpenRouter
          </div>
        </div>
      </div>
    `;
    
    responseArea.innerHTML = html;
  }
  
  // Handle Enter key
  promptInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      console.log("Enter key pressed");
      event.preventDefault();
      handleSearch();
    }
  });
  
  // Handle Search button click
  searchButton.addEventListener('click', () => {
    handleSearch();
  });
  
  // Add some basic animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    
    .markdown-content h1 { font-size: 1.8rem; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    .markdown-content h2 { font-size: 1.5rem; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    .markdown-content h3 { font-size: 1.2rem; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    .markdown-content p { margin-bottom: 1em; line-height: 1.6; }
    .markdown-content ul, .markdown-content ol { margin-bottom: 1em; padding-left: 2em; line-height: 1.6; }
    .markdown-content li { margin-bottom: 0.5em; }
    .markdown-content code { font-family: 'Courier New', monospace; background: rgba(40, 40, 40, 0.7); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    .markdown-content pre { background: rgba(40, 40, 40, 0.7); padding: 1em; border-radius: 5px; overflow-x: auto; margin: 1em 0; }
    .markdown-content pre code { background: transparent; padding: 0; border-radius: 0; }
    .markdown-content blockquote { border-left: 3px solid #9370db; margin: 1em 0; padding-left: 1em; color: #aaa; }
    
    .conversation-container {
      max-height: 300px;
      overflow-y: auto;
      border-radius: 5px;
      margin-bottom: 20px;
      padding: 10px;
      background-color: rgba(30, 30, 30, 0.3);
    }
  `;
  document.head.appendChild(style);
  console.log("Animation and markdown styles added");
});

