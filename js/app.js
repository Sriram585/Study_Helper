// Main App Controller
console.log("App Controller Loaded");

const landingPhase = document.getElementById('landing-phase');
const cockpitPhase = document.getElementById('cockpit-phase');
const conceptInput = document.getElementById('concept-input');
const graphContainer = document.getElementById('3d-graph');

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
    // slight delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        cockpitPhase.classList.remove('opacity-0');

        // 3. Adjust Graph (Zoom in/Change data)
        if (window.updateGraphFocus) {
            window.updateGraphFocus(concept);
        }
    }, 100);
}
