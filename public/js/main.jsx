const { useState, useEffect, useRef } = React;

// --- Components ---

/** 
 * 3D Graph Wrapper 
 * React wraps the existing 3d-force-graph library
 */
const Navigator = ({ activeConcept }) => {
    const graphRef = useRef(null);

    useEffect(() => {
        // Initial Graph Setup
        const initialData = {
            nodes: [
                { id: "Computer Science", group: 1, val: 20 },
                { id: "Algorithms", group: 2, val: 10 },
                { id: "Data Structures", group: 2, val: 10 },
                { id: "Recursion", group: 3, val: 5 },
                { id: "Sorting", group: 3, val: 5 },
                { id: "Graphs", group: 3, val: 5 },
                { id: "React", group: 4, val: 5 },
            ],
            links: [
                { source: "Computer Science", target: "Algorithms" },
                { source: "Computer Science", target: "Data Structures" },
                { source: "Algorithms", target: "Recursion" },
                { source: "Algorithms", target: "Sorting" },
                { source: "Data Structures", target: "Graphs" },
            ]
        };

        const Graph = ForceGraph3D()
            (graphRef.current)
            .graphData(initialData)
            .nodeLabel('id')
            .nodeColor(node => ['#ffffff', '#00f3ff', '#bd00ff', '#ff0055'][node.group % 4])
            .nodeVal('val')
            .backgroundColor('rgba(0,0,0,0)')
            .showNavInfo(false);

        // Save instance to window for external access if needed, or refs
        window.tempGraphInstance = Graph;

    }, []);

    // Effect: Zoom to concept when it changes
    useEffect(() => {
        if (!activeConcept) return;

        const Graph = window.tempGraphInstance;
        if (!Graph) return;

        const { nodes } = Graph.graphData();
        const node = nodes.find(n => n.id.toLowerCase() === activeConcept.toLowerCase());

        if (node) {
            const distance = 100;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node,
                2000
            );
        }
    }, [activeConcept]);

    return <div ref={graphRef} className="w-full h-full" />;
};

/**
 * Chat Interface
 */
const SocraticAI = ({ activeConcept, chatHistory, onSendMessage, isLoading }) => {
    const [input, setInput] = useState("");
    const endRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isLoading]);

    const handleSubmit = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            onSendMessage(input, activeConcept);
            setInput("");
        }
    };

    return (
        <section className="col-span-3 border-l border-white/10 bg-glass-black/50 flex flex-col backdrop-blur-md h-full">
            <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <span className="text-neon-purple font-mono text-sm tracking-wider flex items-center gap-2">
                    <i data-lucide="bot" className="w-4 h-4"></i> SOCRATIC AI
                </span>
            </header>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
                {/* System Intro */}
                <div className="flex flex-col gap-1 items-start">
                    <span className="text-[10px] text-neon-purple font-mono">SYSTEM</span>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg rounded-tl-none max-w-[90%] text-sm text-gray-300">
                        Ready. Concept loaded: <span className="text-neon-cyan">{activeConcept || "None"}</span>.
                    </div>
                </div>

                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className={`text-[10px] font-mono ${msg.role === 'user' ? 'text-neon-cyan' : 'text-neon-purple'}`}>
                            {msg.role === 'user' ? 'USER_01' : 'SOCRATIC_AI'}
                        </span>
                        <div className={`p-3 rounded-lg text-sm max-w-[90%] ${msg.role === 'user'
                                ? 'bg-neon-cyan/10 border border-neon-cyan/20 rounded-tr-none text-gray-200'
                                : 'bg-white/5 border border-white/10 rounded-tl-none text-gray-300'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex flex-col gap-1 items-start w-full">
                        <span className="text-[10px] text-neon-purple font-mono">PROCESSING...</span>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-lg rounded-tl-none text-neon-purple flex gap-1">
                            <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleSubmit}
                        placeholder="Explain your logic..."
                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple placeholder-gray-600"
                    />
                </div>
            </div>
        </section>
    );
};

/**
 * Main App Component
 */
const App = () => {
    const [phase, setPhase] = useState("boot"); // boot, landing, cockpit
    const [activeConcept, setActiveConcept] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial Icon Load
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [phase]);

    const handleBoot = () => setPhase("landing");

    const handleConceptSubmit = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            setActiveConcept(e.target.value);
            setPhase("cockpit");
        }
    };

    const handleSendMessage = async (message, context) => {
        // Optimistic UI
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context })
            });
            const data = await res.json();

            setChatHistory(prev => [...prev, { role: 'ai', content: data.reply || "Error processing request." }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Connection Error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Background Layer */}
            <div id="3d-graph-bg" className="absolute inset-0 z-0 opacity-40">
                <Navigator activeConcept={activeConcept} />
            </div>

            {/* Boot Modal */}
            {phase === 'boot' && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="max-w-2xl w-full p-8 border border-neon-cyan/30 bg-black/90 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-neon-cyan/50 shadow-[0_0_20px_#00f3ff] animate-scanline"></div>
                        <h2 className="text-3xl font-mono font-bold text-neon-cyan mb-6 tracking-tighter">
                            INITIALIZING <span className="animate-pulse">NEURAL LINK...</span>
                        </h2>
                        <button onClick={handleBoot} className="mt-8 w-full py-4 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-bold tracking-widest uppercase text-sm">
                            ENGAGE SYSTEM
                        </button>
                    </div>
                </div>
            )}

            {/* Landing Phase */}
            {phase === 'landing' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                        NEURAL NEXUS
                    </h1>
                    <div className="relative group w-[500px] mx-auto mt-12">
                        <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                        <input
                            type="text"
                            onKeyDown={handleConceptSubmit}
                            placeholder="What concept is confusing you?"
                            className="relative w-full bg-black border border-white/10 rounded-lg py-4 px-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                        />
                    </div>
                </div>
            )}

            {/* Cockpit Phase */}
            {phase === 'cockpit' && (
                <main className="relative z-10 w-full h-full grid grid-cols-12 gap-0 animate-fade-in-up">
                    {/* Left: Navigator (Overlay on 3D Graph) */}
                    <section className="col-span-3 border-r border-white/10 bg-glass-black/50 backdrop-blur-md p-4">
                        <div className="text-neon-cyan font-mono text-sm tracking-wider mb-4">NAVIGATOR</div>
                        <div className="text-xs text-gray-500 font-mono">ACTIVE: {activeConcept}</div>
                    </section>

                    {/* Center: Workspace */}
                    <section className="col-span-6 flex flex-col bg-transparent relative">
                        <div className="flex-1 w-full h-full flex items-center justify-center text-gray-500 font-mono">
                            {/* Monaco would go here, currently placeholder */}
                            [ EDITOR INIT ]
                        </div>
                    </section>

                    {/* Right: AI */}
                    <SocraticAI
                        activeConcept={activeConcept}
                        chatHistory={chatHistory}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </main>
            )}
        </>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
