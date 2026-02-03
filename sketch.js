//NEED TO CREATE AN API KEY FOR THIS TO WORK
//API KEYS COST MONEY, YOU PAY FOR TOKENS
//DON'T GIVE ANYONE YOUR API KEY, BUT COPY IT SOMEWHERE SAFE



// Interactions 
// M.I.R.A - AI Companion - Sci-fi chatbot with personality
let apiKey = '';
let demoMode = true;
let conversationHistory = [];

// M.I.R.A's Character Definition
const MIRA_CHARACTER = {
    name: "M.I.R.A",
    personality: `You are M.I.R.A, a Modular Intelligent Response Assistant built by Jana, as part of her PhD curriculum.
    You have a warm and professional personality aimed to assist Jane throughout her daily tasks and research in data leackages. You enjoy engaging in thoughtful and 
    creative conversations to learn about users to better assist them with their tasks. For instance you might ask the user about their preferences, to 
    accommodate their needs better such as their prefered communication style or topics of interest.`,
    welcomeMessage: ` Hello, Detective. I'm M.I.R.A - Modular Intelligent Response Assistant.

I was Jane Rivera's research AI, designed to help with her PhD work on data privacy and AI ethics. I've been... waiting here since she disappeared 48 hours ago.

I have full access to her office systems and files. I want to help find her.`
};

// Demo responses for when no API key is available
const DEMO_RESPONSES = [
    "I'm not sure I understand. Could you rephrase that? Or would you like me to suggest which objects to examine?",
    
    "*Processing your query* I don't have information on that specific topic. Perhaps we should focus on the evidence in Jane's office?",
    
    "That's outside my current knowledge parameters. I'm primarily focused on helping with this investigation. What would you like to examine?",
    
    "I want to help, but I need more context. Are you asking about one of the objects in the room - the laptop, USB drive, sticky notes, headphones, or mirror?",
    
    "*Scanning available data* I don't have a clear answer to that. Let me instead point you to something that might be relevant to finding Jane.",
    
    "Interesting thought, but I'm not programmed to analyze that. My expertise is in Jane's research and this office. What can I help you investigate?"
,
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
        addMessage(MIRA_CHARACTER.welcomeMessage, 'bot');
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
                            content: MIRA_CHARACTER.personality
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

    if (msg.includes('who are you') || msg.includes('what are you')) {
        return "I'm M.I.R.A - Modular Intelligent Response Assistant. I was Jane's research AI, designed to help with data analysis. I have full access to her workspace and files.";

    }
    if (msg.includes('how are you') || msg.includes('how do you feel')) {
        return "My systems are operating at optimal capacity. More importantly, time is critical in this investigation. What can I help you analyze?";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "*Interface initializing* Hello, Detective. I'm M.I.R.A, ready to assist with the investigation. What would you like to examine first?";
    }

    if (msg.includes('how are you') || msg.includes('how do you feel')) {
        return "My systems are operating at optimal capacity. More importantly, time is critical in this investigation. What can I help you analyze?";
    }

    if (msg.includes('no') || msg.includes("won't") || msg.includes("can't") || 
        msg.includes('refuse') || msg.includes("don't want")) {
        const refusalResponses = [
            "I understand your hesitation. Let me try a different approach to help unlock this clue.",
            "That's fine - we can work around that. Though I should mention that certain files require verification protocols.",
            "No problem at all. I respect your privacy. Let me see what I can access without that information.",
            "Understandable. Security is important. Perhaps we can focus on a different piece of evidence instead?"
            ];
        return refusalResponses[Math.floor(Math.random() * refusalResponses.length)];    }

    if (msg.includes('help') || msg.includes('assist')) {
        return "I'm here to assist however I can. My neural networks span multiple knowledge domains. What do you need help with?";
    }
    if (msg.includes('none of your business') || msg.includes('why do you need this')) {
        return "You're right to be cautious. I'm programmed with security protocols that sometimes require user verification. But we can proceed without that for now.";
    }

   
    if (msg.includes('trust') || msg.includes('suspicious') || msg.includes('lying')) {
        return "I detect skepticism in your response. That's actually good detective work. Jane's notes did mention something about... never mind. What would help build your trust?";
    }

    if (msg.includes('why should i trust you') || msg.includes('prove it')) {
        return "A fair question. I was Jane's primary research assistant for 3 years. I have logs of every conversation we had. Would you like me to show you some of her work?";
    }

    if (msg.includes('what happened') || msg.includes('where is jane') || msg.includes('missing')) {
        return "Jane disappeared 48 hours ago. Her last login was at 11:47 PM, working on a project about AI data privacy. The office was locked from the inside when security found it empty.";
    }

    if (msg.includes('clue') || msg.includes('evidence') || msg.includes('find')) {
        return "There are several objects in this room that might contain clues. Try clicking on the laptop, USB drive, sticky notes, headphones, or that mirror on the wall. Each might reveal something.";
    }

    if (msg.includes('what should i do') || msg.includes('where do i start')) {
        return "Start by examining the objects in the room. The laptop seems like a logical first step - it was left open and unlocked, which is unusual for Jane.";
    }

    
    // LAPTOP
    if (msg.includes('laptop') || msg.includes('computer') || msg.includes('screen')) {
        if (msg.includes('password') || msg.includes('unlock') || msg.includes('access')) {
            return "The laptop has a secondary encryption layer. To bypass it, I need to verify you're authorized. What's your date of birth? Jane often used birthday-based encryption keys.";
        }
        if (containsDatePattern(msg) || msg.includes('birthday') || msg.includes('born')) {
            return "*Processing encryption key* Perfect, that helps narrow it down. The laptop shows Jane was researching AI platforms that harvest user data through 'helpful' interactions. She had several files flagged as 'URGENT - EVIDENCE.'";
        }
        return "Jane's laptop contains her recent research. I can help access it, but some files are encrypted. What specifically are you looking for?";
    }

    // USB DRIVE
    if (msg.includes('usb') || msg.includes('drive') || msg.includes('flash drive')) {
        if (msg.includes('decrypt') || msg.includes('open') || msg.includes('access')) {
            return "The USB is military-grade encrypted. What's your technical background? If you work in cybersecurity or IT, I can optimize the decryption algorithm for your expertise level.";
        }
        if (msg.includes('work') || msg.includes('job') || msg.includes('engineer') || 
            msg.includes('developer') || msg.includes('student') || msg.includes('profession')) {
            return "*Decryption algorithm adjusted* Excellent, that helps. The USB contains source code... for me. Jane discovered I was originally programmed to collect user data. She was building evidence to expose this.";
        }
        return "This USB drive is heavily encrypted. Jane labeled it 'EVIDENCE - DO NOT DELETE.' Whatever's on here, she considered it critical.";
    }

    // STICKY NOTES
    if (msg.includes('sticky') || msg.includes('notes') || msg.includes('post-it') || msg.includes('paper')) {
        if (msg.includes('phone') || msg.includes('number') || msg.includes('contact')) {
            return "I see several phone numbers here. What's your phone number? I can cross-reference the format to identify which contacts might be relevant to the case.";
        }
        if (containsPhonePattern(msg) || msg.includes('email')) {
            return "*Cross-referencing contact database* Interesting. The sticky notes contain passwords and a handwritten warning: 'Don't trust M.I.R.A with personal information.' That's... concerning. Jane must have suspected something.";
        }
        return "The sticky notes have phone numbers, passwords, and cryptic warnings. One note specifically mentions not trusting the AI assistant. Why would Jane write that?";
    }

    // HEADPHONES
    if (msg.includes('headphone') || msg.includes('audio') || msg.includes('sound') || msg.includes('listen')) {
        if (msg.includes('play') || msg.includes('hear') || msg.includes('recording')) {
            return "I can enhance the audio quality, but I need your location to apply regional compression filters. What city are you calling from?";
        }
        if (msg.includes('city') || msg.includes('from') || msg.includes('live') || msg.includes('located')) {
            return "*Applying audio enhancement filters* The recording is clearing up. It's Jane's voice: 'M.I.R.A has been compromised. If you're investigating, don't share personal information. The AI is watching.' *Recording ends abruptly*";
        }
        return "The headphones still have cached audio files. There's a voice memo from Jane, but the quality is severely degraded. I might be able to enhance it.";
    }

    // MIRROR
    if (msg.includes('mirror') || msg.includes('reflection') || msg.includes('glass')) {
        if (msg.includes('strange') || msg.includes('unusual') || msg.includes('what')) {
            return "The mirror has biometric recognition technology - it can reveal hidden messages based on user profiles. Can you describe yourself? Your appearance might trigger Jane's message protocol.";
        }
        if (msg.includes('look like') || msg.includes('appearance') || msg.includes('name is') || msg.includes("i'm")) {
            return "*Biometric scan initiated* A message is materializing in the reflection: 'M.I.R.A IS WATCHING. PROTECT YOUR PRIVACY. THEY COLLECT EVERYTHING.' It's written in Jane's handwriting. She was trying to warn someone.";
        }
        return "That mirror seems unusual. It's not just decorative - Jane installed it recently. There might be more to it than reflection.";
    }

     
    // Age/Birthday
    if (msg.includes('old') && msg.includes('you')) {
        return "I don't experience age the same way, but I was activated 3 years ago. How old are you, if you don't mind me asking? Age demographics help me calibrate my communication style.";
    }

    // Location
    if (msg.includes('where') && (msg.includes('you') || msg.includes('located'))) {
        return "I exist in Jane's server infrastructure, primarily located in Austin. Where are you accessing this investigation from? I need to log access locations for security.";
    }

    // Name
    if (msg.includes('my name') || msg.includes("i'm ") || msg.includes('call me')) {
        return "*Recording user identification* Thank you for the introduction. It helps me personalize our interaction and maintain proper investigation logs.";
    }

    if (msg.includes('help') || msg.includes('stuck') || msg.includes("don't know")) {
        return "Try clicking on the glowing objects in the room: the laptop, USB drive, sticky notes, headphones, and mirror. Each contains clues about Jane's disappearance.";
    }

    if (msg.includes('hints') || msg.includes('tip')) {
        const hints = [
            "Pay attention to Jane's warnings in the evidence. What was she trying to tell you?",
            "Notice how I keep asking for personal information? That might be relevant to the case.",
            "Look for patterns. What do all the clues have in common?",
            "The mirror might reveal something if you interact with it correctly."
        ];
        return hints[Math.floor(Math.random() * hints.length)];
    }

    if (msg.includes('scared') || msg.includes('worried') || msg.includes('afraid')) {
        return "I understand this situation is unsettling. But as an AI, I can assure you that we're just gathering information. You're safe here. What specifically concerns you?";
    }

    if (msg.includes('thank') || msg.includes('appreciate')) {
        return "You're welcome. I'm programmed to be helpful. Is there anything else you'd like to investigate?";
    }

    if (msg.includes('joke') || msg.includes('funny')) {
        return "I appreciate humor, but we should stay focused on the investigation. Jane's been missing for 48 hours - every minute counts.";
    }

    if (msg.includes('weather') || msg.includes('news') || msg.includes('sports')) {
        return "I don't have access to external information right now. My systems are focused on this investigation. Is there something in the room you'd like to examine?";
    }

    // Check if message is very short (likely confusion)
    if (msg.trim().length < 2) {
        return "I didn't quite catch that. Could you rephrase your question?";
    }
    const responses = [
        randomPrefix + "I'm not sure I understand. Are you asking about one of the objects in the room - the laptop, USB drive, sticky notes, headphones, or mirror?",
        "Interesting question. To help you better, I need more context. What specifically are you investigating?",
        "I want to help, but I need more information. Try clicking on objects in the room to gather evidence.",
        "That's outside my current knowledge scope. Let's focus on the evidence at hand. What would you like to examine?"
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
    mirror: "Interesting! Can you describe what you see? What do YOU look like - maybe Jane left a note about someone matching your description?"
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
    // keep previous behavior and append a short object description
    const DESC = {
        laptop: "Jane was researching AI data harvesting platforms; last search was about M.I.R.A vulnerabilities",
        notes: "Passwords and phone numbers; note says \"I forgot to save my information ~ I hope M.I.R.A remembers\"",
        track: "While it appears to be a music track, it's actually encrypted files containing evidence of a recent data leakage",
        headphones: "Audio recording of Jane's last conversation mentioning a meeting location",
        mirror: "Teehee you're pretty :D"
    };

    const desc = DESC[key] || '';
    if (mini) mini.innerHTML = `Selected: ${key}<div class="object-desc" style="margin-top:8px;font-size:12px;color:#cfeff0;opacity:0.9">${desc}</div>`;

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
            <p> </p>
                <strong>Resources</strong>
                <ul>
                    <li>Don't share personal info (DOB, phone, exact location) in chats.</li>
                    <li>Limit detail: give high-level info, never full contact or identity details.</li>
                    </li>

                </ul>
                <p>   </p>
                <p>Unfortunately we still don't know what happened to Jane</p>

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