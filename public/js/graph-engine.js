// Graph Engine - Handles 3D visualizations
console.log("Graph Engine Loaded");

// Mock Data: Concepts relating to Computer Science
const initialData = {
    nodes: [
        { id: "Computer Science", group: 1, val: 20 },
        { id: "Algorithms", group: 2, val: 10 },
        { id: "Data Structures", group: 2, val: 10 },
        { id: "Web Dev", group: 2, val: 10 },
        { id: "Recursion", group: 3, val: 5 },
        { id: "Sorting", group: 3, val: 5 },
        { id: "Trees", group: 3, val: 5 },
        { id: "Graphs", group: 3, val: 5 },
        { id: "React", group: 4, val: 5 },
        { id: "Next.js", group: 4, val: 5 },
    ],
    links: [
        { source: "Computer Science", target: "Algorithms" },
        { source: "Computer Science", target: "Data Structures" },
        { source: "Computer Science", target: "Web Dev" },
        { source: "Algorithms", target: "Recursion" },
        { source: "Algorithms", target: "Sorting" },
        { source: "Data Structures", target: "Trees" },
        { source: "Data Structures", target: "Graphs" },
        { source: "Web Dev", target: "React" },
        { source: "React", target: "Next.js" },
    ]
};

const elem = document.getElementById('3d-graph');

const Graph = ForceGraph3D()
    (elem)
    .graphData(initialData)
    .nodeLabel('id')
    .nodeColor(node => {
        // Neon Colors based on group
        const colors = ['#ffffff', '#00f3ff', '#bd00ff', '#ff0055', '#ffff00'];
        return colors[node.group % colors.length];
    })
    .nodeVal('val')
    .linkColor(() => 'rgba(255,255,255,0.2)')
    .backgroundColor('rgba(0,0,0,0)') // Transparent
    .showNavInfo(false)
    .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    });

// Auto-spin logic
let angle = 0;
const distance = 1000;
let isSpinning = true;

setInterval(() => {
    if (isSpinning) {
        Graph.cameraPosition({
            x: distance * Math.sin(angle),
            z: distance * Math.cos(angle)
        });
        angle += Math.PI / 300;
    }
}, 10);

// Expose Graph API
window.updateGraphFocus = (concept) => {
    console.log(`Graph focusing on: ${concept}`);
    isSpinning = false; // Stop auto-spin

    // 1. Add new node if it doesn't exist (Visual effect of "Exploding")
    const { nodes, links } = Graph.graphData();

    // Check if node exists
    let targetNode = nodes.find(n => n.id.toLowerCase() === concept.toLowerCase());

    if (!targetNode) {
        // Create it dynamically
        targetNode = { id: concept, group: 5, val: 15, x: 0, y: 0, z: 0 };
        nodes.push(targetNode);
        links.push({ source: "Computer Science", target: concept });

        Graph.graphData({ nodes, links });
    }

    // 2. Zoom into it
    setTimeout(() => {
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(targetNode.x || 1, targetNode.y || 1, targetNode.z || 1);

        Graph.cameraPosition(
            { x: (targetNode.x || 0) + 50, y: (targetNode.y || 0) + 50, z: (targetNode.z || 0) + 100 },
            targetNode,
            2000
        );
    }, 500);

    // 3. Update active nodes list in UI
    updateNavigatorList(nodes);
};

function updateNavigatorList(nodes) {
    const list = document.getElementById('node-list');
    if (list) {
        list.innerHTML = nodes.map(n =>
            `<li class="text-gray-400 hover:text-neon-cyan cursor-pointer transition-colors text-xs py-1 border-b border-white/5">
                ${n.id}
            </li>`
        ).join('');
    }
}

// Initial List Pop
updateNavigatorList(initialData.nodes);
