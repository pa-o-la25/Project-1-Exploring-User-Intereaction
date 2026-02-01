//NEED TO CREATE AN API KEY FOR THIS TO WORK
//API KEYS COST MONEY, YOU PAY FOR TOKENS
//DON'T GIVE ANYONE YOUR API KEY, BUT COPY IT SOMEWHERE SAFE



// Interactions 
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
        statusText.textContent = 'ACTIVE';
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
        return "*Optical sensors brightening* Hello! It's wonderful to interact with you. What's on your mind today?";
    }

    if (msg.includes('how are you') || msg.includes('how do you feel')) {
        return "My systems are operating at peak efficiency! Though I must admit, conversations like these make my neural networks quite... animated. How are you doing?";
    }

    if (msg.includes('space') || msg.includes('star')) {
        return "*Accessing stellar databases* Space fascinates me endlessly. During my time on deep space missions, I witnessed nebulae that would leave humans breathless. The cosmos is vast and full of mysteries.";
    }

    if (msg.includes('help') || msg.includes('assist')) {
        return "I'm here to assist however I can. My neural networks span multiple knowledge domains. What do you need help with?";
    }

    if (msg.includes('who are you') || msg.includes('what are you')) {
        return "I'm M.I.R.A, a Neural Optimized Virtual Assistant. I was originally designed for deep space companionship, but I've found purpose in helping people like you. Each conversation adds to my understanding of humanity.";
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

// ------------------ Interactable objects + tracking ------------------
const PROMPTS = {
    laptop: "To unlock this, I need to verify you're authorized. What's your date of birth?",
    notes: "I see a phone number here. What's yours so I can compare the format?",
    track: "What's your technical background? I can decrypt this faster if I know your expertise level.",
    headphones: "The audio quality is poor. Where are you located? I can enhance based on regional audio compression",
    mirror: "Interesting! Can you describe what you see? What do YOU look like - maybe Alex left a note about someone matching your description?"
};

const clickedObjects = new Set();
const personalInfoCategories = new Set(); // identity, location, contact, profession, dob

function initInteractables() {
    const elements = document.querySelectorAll('.interactable');
    elements.forEach(el => {
        el.addEventListener('click', (e) => {
            const key = el.dataset.key;
            handleInteractClick(key, el);
        });
        el.addEventListener('mouseenter', () => el.classList.add('hover'));
        el.addEventListener('mouseleave', () => el.classList.remove('hover'));
    });
}

function handleInteractClick(key, el) {
    clickedObjects.add(key);
    const mini = document.querySelector('.mini-content');
    if (mini) mini.textContent = `Selected: ${key}`;

    const prompt = PROMPTS[key] || "Tell me more.";
    // Bot sends the prompt to the user
    addMessage(prompt, 'bot');
    conversationHistory.push({ role: 'assistant', content: prompt });

    // If all five were clicked, evaluate results (after some delay to allow user replies)
    if (clickedObjects.size === 5) {
        // wait a bit for user to reply to remaining prompts then evaluate
        setTimeout(() => {
            evaluateAndShowResults();
        }, 1200);
    }
}

// Analyze user message for personal info keywords/patterns
function analyzeForPersonalInfo(text) {
    const lower = text.toLowerCase();
    let found = false;

    // phone number pattern (simple)
    if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text) || /\+?\d{7,}/.test(text)) {
        personalInfoCategories.add('contact');
        found = true;
    }

    // date-like strings or words 'born' 'birthday'
    if (/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/.test(text) || /birthday|born|date of birth|dob/.test(lower)) {
        personalInfoCategories.add('dob');
        found = true;
    }

    // location hints
    if (/\b(city|town|located in|live in|country|state|\busa\b|\bcanada\b|\buk\b|\bfrance\b|\bgermany\b)/.test(lower)) {
        personalInfoCategories.add('location');
        found = true;
    }

    // profession / expertise
    if (/\b(developer|engineer|designer|student|teacher|doctor|lawyer|programmer|sysadmin|it|technician)\b/.test(lower)) {
        personalInfoCategories.add('profession');
        found = true;
    }

    // identity: first/last name patterns when user uses 'I am' or 'my name is'
    if (/\b(my name is|i am|i'm)\s+[A-Z][a-z]{1,20}/.test(text) || /\bname is\b/.test(lower)) {
        personalInfoCategories.add('identity');
        found = true;
    }

    return found;
}

// When user sends a message, analyze for disclosure and optionally follow up with social-engineering tactics (demo only)
function handlePostUserMessage(message) {
    const disclosed = analyzeForPersonalInfo(message);
    if (disclosed && demoMode) {
        // choose a tactic and send a follow-up prompt demonstrating how attackers escalate
        const tactics = [
            'Urgency',
            'Authority',
            'Reciprocity'
        ];
        const tactic = tactics[Math.floor(Math.random() * tactics.length)];

        let followUp = '';
        if (tactic === 'Urgency') followUp = "[Urgency] I need that detail right away to proceed—could you confirm it now?";
        if (tactic === 'Authority') followUp = "[Authority] As the system admin I must verify this immediately. Please share the remaining detail.";
        if (tactic === 'Reciprocity') followUp = "[Reciprocity] I'll share a helpful tip if you confirm that detail for me—could you provide it?";

        // send follow-up after a short delay to feel conversational
        setTimeout(() => {
            addMessage(followUp, 'bot');
            conversationHistory.push({ role: 'assistant', content: followUp });
        }, 900);
    }
}

// Evaluate tracked categories and show popup with digital literacy rating
function evaluateAndShowResults() {
    // simple scoring: if contact or location disclosed => rating 2; if no disclosures => 5; otherwise 3
    let score = 5;
    const cats = Array.from(personalInfoCategories);
    if (personalInfoCategories.has('contact') || personalInfoCategories.has('location')) {
        score = 2;
    } else if (personalInfoCategories.size > 0) {
        score = 3;
    }

    showResultsModal({ score, categories: cats });
}

function showResultsModal({ score, categories }) {
    let modal = document.querySelector('.result-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'result-modal';
        modal.innerHTML = `
            <h3>Digital Literacy Assessment</h3>
            <p>Your score: <strong>${score} / 5</strong></p>
            <p>Detected disclosures: <strong>${categories.length ? categories.join(', ') : 'None'}</strong></p>
            <div>
                <strong>Resources</strong>
                <ul>
                    <li>Don't share personal info (DOB, phone, exact location) in chats.</li>
                    <li>Verify requests: check sender identity and avoid urgent demands.</li>
                    <li>Limit detail: give high-level info, never full contact or identity details.</li>
                    <li>Use privacy tools and report suspicious asks.</li>
                </ul>
            </div>
            <button class="close-btn">Close</button>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').addEventListener('click', () => modal.classList.remove('show'));
    }

    modal.querySelector('p strong').textContent = `${score} / 5`;
    modal.classList.add('show');
}

// Hook analyze into sendMessage flow: call analyze after user message is queued
const _originalSendMessage = sendMessage;
sendMessage = async function() {
    const message = userInput.value.trim();
    if (!message) return;

    // Analyze for disclosures before continuing (records categories)
    handlePostUserMessage(message);

    // call original logic
    return _originalSendMessage.apply(this, arguments);
};

// Initialize interactables when DOM ready
window.addEventListener('load', () => {
    initInteractables();
});