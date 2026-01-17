// Main App Controller
console.log("App Controller Loaded");

const landingPhase = document.getElementById('landing-phase');
const cockpitPhase = document.getElementById('cockpit-phase');
const conceptInput = document.getElementById('concept-input');
const graphContainer = document.getElementById('3d-graph');
const bootModal = document.getElementById('boot-modal');
const bootBtn = document.getElementById('boot-btn');

// Boot Sequence
bootBtn.addEventListener('click', () => {
    bootModal.classList.add('opacity-0', 'pointer-events-none', 'scale-95'); // Fade out
    setTimeout(() => {
        bootModal.style.display = 'none';
        landingPhase.classList.add('opacity-100'); // Ensure landing is visible
    }, 500);
});

// Event Listener for "Login" / Concept Entry
conceptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
        transitionToCockpit(e.target.value);
    }
});

function transitionToCockpit(concept) {
    console.log(`Transitioning to Cockpit for concept: ${concept}`);

    // 1. Fade out landing
    landingPhase.classList.add('opacity-0', 'pointer-events-none');

    // 2. Show Cockpit
    cockpitPhase.classList.remove('hidden');

    // Add Welcome Message from AI
    addAIMessage(`Welcome, User. I have loaded the context for **${concept}**. I am ready to assist.`);

    // slight delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        cockpitPhase.classList.remove('opacity-0');

        // 3. Adjust Graph (Zoom in/Change data)
        if (window.updateGraphFocus) {
            window.updateGraphFocus(concept);
        }
    }, 100);
}

// Chat Logic
const chatInput = document.getElementById('ai-input');
const chatHistory = document.getElementById('chat-history');

chatInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
        const msg = e.target.value;
        e.target.value = ""; // Clear input

        // Add User Message
        addUserMessage(msg);

        // Show Loading
        const loadingId = addLoadingIndicator();

        try {
            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    context: conceptInput.value // Pass the active concept
                })
            });

            const data = await response.json();

            // Remove Loading
            removeMessage(loadingId);

            if (response.ok) {
                addAIMessage(data.reply);
            } else {
                addAIMessage("Error: " + (data.detail || "System Malfunction"));
            }
        } catch (err) {
            removeMessage(loadingId);
            addAIMessage("Connection Error: Is the Neural Link (Server) active?");
        }
    }
});

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = "flex flex-col gap-1 items-end self-end w-full"; // Right align
    div.innerHTML = `
        <span class="text-[10px] text-neon-cyan font-mono">USER_01</span>
        <div class="bg-neon-cyan/10 border border-neon-cyan/20 p-3 rounded-lg rounded-tr-none text-sm text-gray-200 shadow-sm shadow-neon-cyan/5">
            ${text}
        </div>
    `;
    chatHistory.appendChild(div);
    scrollToBottom();
}

function addAIMessage(text) {
    // Simple markdown parsing for bold
    const parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-purple">$1</strong>');

    const div = document.createElement('div');
    div.className = "flex flex-col gap-1 items-start w-full"; // Left align
    div.innerHTML = `
        <span class="text-[10px] text-neon-purple font-mono">SOCRATIC_AI</span>
        <div class="bg-white/5 border border-white/10 p-3 rounded-lg rounded-tl-none max-w-[90%] text-sm text-gray-300">
            ${parsed}
        </div>
    `;
    chatHistory.appendChild(div);
    scrollToBottom();
}

function addLoadingIndicator() {
    const id = "loading-" + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = "flex flex-col gap-1 items-start w-full";
    div.innerHTML = `
        <span class="text-[10px] text-neon-purple font-mono">PROCESSING...</span>
        <div class="bg-white/5 border border-white/10 p-3 rounded-lg rounded-tl-none text-neon-purple flex gap-1">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `;
    chatHistory.appendChild(div);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
