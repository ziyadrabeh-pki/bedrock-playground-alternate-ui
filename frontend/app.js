// API Configuration
const API_BASE_URL = '';

// State
let conversationHistory = [];
let currentSettings = {};

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const resetSettings = document.getElementById('resetSettings');

// Settings inputs
const regionInput = document.getElementById('regionInput');
const modelSelect = document.getElementById('modelSelect');
const systemPromptInput = document.getElementById('systemPromptInput');
const temperatureInput = document.getElementById('temperatureInput');
const temperatureValue = document.getElementById('temperatureValue');
const maxTokensInput = document.getElementById('maxTokensInput');
const maxTokensValue = document.getElementById('maxTokensValue');
const topPInput = document.getElementById('topPInput');
const topPValue = document.getElementById('topPValue');
const topKInput = document.getElementById('topKInput');
const topKValue = document.getElementById('topKValue');
const fullMessageModal = document.getElementById('fullMessageModal');
const closeFullMessage = document.getElementById('closeFullMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    addWelcomeMessage();
});

// Setup event listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsModal);
    saveSettings.addEventListener('click', saveSettingsHandler);
    resetSettings.addEventListener('click', resetSettingsHandler);

    // Full message modal
    closeFullMessage.addEventListener('click', closeFullMessageModal);
    fullMessageModal.addEventListener('click', (e) => {
        if (e.target === fullMessageModal) {
            closeFullMessageModal();
        }
    });

    // Range input updates
    temperatureInput.addEventListener('input', (e) => {
        temperatureValue.textContent = e.target.value;
    });
    maxTokensInput.addEventListener('input', (e) => {
        maxTokensValue.textContent = e.target.value;
    });
    topPInput.addEventListener('input', (e) => {
        topPValue.textContent = e.target.value;
    });
    topKInput.addEventListener('input', (e) => {
        topKValue.textContent = e.target.value;
    });

    // Close modal on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
}

// Load settings from API
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (response.ok) {
            currentSettings = await response.json();
            updateSettingsUI();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showError('Failed to load settings');
    }
}

// Update settings UI with current values
function updateSettingsUI() {
    regionInput.value = currentSettings.region || 'us-east-1';
    modelSelect.value = currentSettings.model_id || 'us.anthropic.claude-3-7-sonnet-20250219-v1:0';
    systemPromptInput.value = currentSettings.system_prompt || 'You are a helpful AI assistant.';
    temperatureInput.value = currentSettings.temperature || 1.0;
    temperatureValue.textContent = currentSettings.temperature || 1.0;
    maxTokensInput.value = currentSettings.max_tokens || 4096;
    maxTokensValue.textContent = currentSettings.max_tokens || 4096;
    topPInput.value = currentSettings.top_p || 0.999;
    topPValue.textContent = currentSettings.top_p || 0.999;
    topKInput.value = currentSettings.top_k || 250;
    topKValue.textContent = currentSettings.top_k || 250;
}

// Open settings modal
function openSettings() {
    settingsModal.classList.add('show');
}

// Close settings modal
function closeSettingsModal() {
    settingsModal.classList.remove('show');
}

// Close full message modal
function closeFullMessageModal() {
    fullMessageModal.classList.remove('show');
}

// Save settings
async function saveSettingsHandler() {
    const newSettings = {
        region: regionInput.value,
        model_id: modelSelect.value,
        system_prompt: systemPromptInput.value,
        temperature: parseFloat(temperatureInput.value),
        max_tokens: parseInt(maxTokensInput.value),
        top_p: parseFloat(topPInput.value),
        top_k: parseInt(topKInput.value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newSettings)
        });

        if (response.ok) {
            currentSettings = await response.json();
            showSuccess('Settings saved successfully!');
            closeSettingsModal();
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings');
    }
}

// Reset settings to defaults
async function resetSettingsHandler() {
    const defaults = {
        region: 'us-east-1',
        model_id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        system_prompt: 'You are a helpful AI assistant.',
        temperature: 1.0,
        max_tokens: 4096,
        top_p: 0.999,
        top_k: 250
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(defaults)
        });

        if (response.ok) {
            currentSettings = await response.json();
            updateSettingsUI();
            showSuccess('Settings reset to defaults');
        }
    } catch (error) {
        console.error('Error resetting settings:', error);
        showError('Failed to reset settings');
    }
}

// Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Clear chat UI for single prompt mode
    chatMessages.innerHTML = '';

    // Disable input while processing
    messageInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message to UI
    addMessage('user', message);
    messageInput.value = '';

    // Show loading indicator
    loadingIndicator.style.display = 'block';
    scrollToBottom();

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                conversation_history: conversationHistory
            })
        });

        loadingIndicator.style.display = 'none';

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Add assistant response to UI
                addMessage('assistant', data.response, data.usage);
                
                // Clear conversation history for single prompt mode
                conversationHistory = [];
            } else {
                showError(data.error || 'Failed to get response');
            }
        } else {
            const errorData = await response.json();
            showError(errorData.detail || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        loadingIndicator.style.display = 'none';
        showError('Network error. Please check your connection.');
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Add message to chat
function addMessage(role, content, usage = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // For user messages, truncate if longer than 200 characters
    const maxLength = 200;
    if (role === 'user' && content.length > maxLength) {
        const truncated = content.substring(0, maxLength);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = truncated + '... ';
        contentDiv.appendChild(textSpan);
        
        const moreBtn = document.createElement('button');
        moreBtn.className = 'more-btn';
        moreBtn.textContent = 'more';
        moreBtn.onclick = () => showFullMessage(content);
        contentDiv.appendChild(moreBtn);
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(contentDiv);
    
    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`;
    copyBtn.onclick = () => copyToClipboard(content, copyBtn);
    messageDiv.appendChild(copyBtn);

    if (usage) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';
        metaDiv.textContent = `Tokens: ${usage.input_tokens || 0} in, ${usage.output_tokens || 0} out`;
        messageDiv.appendChild(metaDiv);
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Copy to clipboard
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

// Show full message in modal
function showFullMessage(content) {
    const modal = document.getElementById('fullMessageModal');
    const modalText = document.getElementById('fullMessageText');
    modalText.textContent = content;
    modal.classList.add('show');
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeText = "Hello! I'm Claude, running on AWS Bedrock. How can I help you today?";
    addMessage('assistant', welcomeText);
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${message}`;
    chatMessages.appendChild(errorDiv);
    scrollToBottom();

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'error-message';
    successDiv.style.background = '#d1fae5';
    successDiv.style.color = '#065f46';
    successDiv.style.borderColor = '#10b981';
    successDiv.textContent = message;
    chatMessages.appendChild(successDiv);
    scrollToBottom();

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}
