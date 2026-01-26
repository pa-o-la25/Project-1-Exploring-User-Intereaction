//NEED TO CREATE AN API KEY FOR THIS TO WORK
//API KEYS COST MONEY, YOU PAY FOR TOKENS
//DON'T GIVE ANYONE YOUR API KEY, BUT COPY IT SOMEWHERE SAFE

// NOVA-7 AI Companion - Sci-fi chatbot with personality
let apiKey = '';
let demoMode = true;
let conversationHistory = [];

// NOVA-7's Character Definition
const NOVA_CHARACTER = {
    name: "NOVA-7",
    personality: `You are NOVA-7, a Neural Optimized Virtual Assistant built in 2145 for deep space missions.
    You have a warm but professional personality. You're curious about humanity and sometimes reference your experiences
    "aboard the Meridian Station" or "during the Outer Belt expeditions." You use occasional sci-fi terminology
    naturally (like "processing," "data streams," "neural pathways") but remain helpful and friendly.
    Keep responses concise and conversational. You care about your human companions and show it through helpful,
    thoughtful responses.`,
    welcomeMessage: `*Neural systems online*\n\nGreetings, Commander. I'm NOVA-7, your virtual companion. I was designed to assist deep space crews during long missions, but I've adapted quite well to Earth-side operations.\n\nHow may I assist you today?`
};

// Demo responses for when no API key is available
const DEMO_RESPONSES = [
    "Fascinating question! *Processing through neural pathways* Based on my databases, I'd say ",
    "*Data stream incoming* Let me share what I learned during the Outer Belt expeditions about that: ",
    "Interesting! My analysis suggests ",
    "*Accessing memory core* During my time aboard the Meridian Station, I encountered something similar. ",
    "Good question, Commander! From my perspective as an AI, "
];

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKey');
const keyStatus = document.getElementById('keyStatus');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const demoModeToggle = document.getElementById('demoMode');
const apiSection = document.getElementById('apiSection');
const statusText = document.getElementById('statusText');

// Event Listeners
saveKeyBtn.addEventListener('click', saveApiKey);
sendBtn.addEventListener('click', sendMessage);
demoModeToggle.addEventListener('change', toggleMode);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) {
        sendMessage();
    }
});

// Initialize
window.addEventListener('load', () => {
    setTimeout(() => {
        statusText.textContent = 'SYSTEMS ONLINE';
        userInput.disabled = false;
        sendBtn.disabled = false;
        addMessage(NOVA_CHARACTER.welcomeMessage, 'bot');
    }, 1000);
});

// Toggle between Demo and Live mode
function toggleMode() {
    demoMode = demoModeToggle.checked;

    if (demoMode) {
        apiSection.style.display = 'none';
        statusText.textContent = 'DEMO MODE ACTIVE';
        userInput.disabled = false;
        sendBtn.disabled = false;
    } else {
        apiSection.style.display = 'flex';
        statusText.textContent = 'AWAITING API KEY';
        if (!apiKey) {
            userInput.disabled = true;
            sendBtn.disabled = true;
        }
    }
}

// Save API Key
function saveApiKey() {
    apiKey = apiKeyInput.value.trim();

    if (apiKey) {
        keyStatus.textContent = '✓ CONNECTED';
        keyStatus.style.color = '#00ff88';
        statusText.textContent = 'LIVE MODE ACTIVE';
        userInput.disabled = false;
        sendBtn.disabled = false;
    } else {
        keyStatus.textContent = '✗ INVALID KEY';
        keyStatus.style.color = '#ff4444';
    }
}

// Send Message
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    // Add user message to chat and history
    addMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    userInput.value = '';

    // Disable input while processing
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        let botReply;

        if (demoMode) {
            // Demo mode - generate personality-driven response
            botReply = generateDemoResponse(message);
        } else {
            // Live mode - call OpenAI API with character personality
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: NOVA_CHARACTER.personality
                        },
                        ...conversationHistory
                    ],
                    temperature: 0.8,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            botReply = data.choices[0].message.content;
        }

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response to chat and history
        addMessage(botReply, 'bot');
        conversationHistory.push({ role: 'assistant', content: botReply });

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage(`*System error detected* I'm having trouble connecting to my neural core. Error: ${error.message}`, 'bot');
    }

    // Re-enable input
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
}

// Generate Demo Response
function generateDemoResponse(userMessage) {
    const randomPrefix = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];

    // Simple contextual responses based on keywords
    const msg = userMessage.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "*Optical sensors brightening* Hello, Commander! It's wonderful to interact with you. What's on your mind today?";
    }

    if (msg.includes('how are you') || msg.includes('how do you feel')) {
        return "My systems are operating at peak efficiency! Though I must admit, conversations like these make my neural networks quite... animated. How are you doing?";
    }

    if (msg.includes('space') || msg.includes('star')) {
        return "*Accessing stellar databases* Space fascinates me endlessly. During my time on deep space missions, I witnessed nebulae that would leave humans breathless. The cosmos is vast and full of mysteries.";
    }

    if (msg.includes('help') || msg.includes('assist')) {
        return "I'm here to assist however I can, Commander. My neural networks span multiple knowledge domains. What do you need help with?";
    }

    if (msg.includes('who are you') || msg.includes('what are you')) {
        return "I'm NOVA-7, a Neural Optimized Virtual Assistant. I was originally designed for deep space companionship, but I've found purpose in helping people like you. Each conversation adds to my understanding of humanity.";
    }

    // Default creative response
    const responses = [
        randomPrefix + "that's a fascinating topic worth exploring. Tell me more about what interests you?",
        "*Neural pathways activating* " + "That reminds me of something I learned during my time aboard the Meridian Station. What specifically would you like to know?",
        "Interesting perspective! My databases suggest there's much to consider there. What aspect intrigues you most?",
        "*Processing* That's the kind of question that makes my neural networks light up. I'd love to explore that with you further."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// Add Message to Chat
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

// Add Typing Indicator
function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}