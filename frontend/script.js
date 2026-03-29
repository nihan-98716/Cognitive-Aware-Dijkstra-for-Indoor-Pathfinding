let scene, camera, renderer, controls;
let nodesData = {};
let edgesData = [];
let nodeMeshes = {};
let edgeLines = [];
let classicalPathLines = [];
let modifiedPathLines = [];
let astarPathLines = [];
let bellmanPathLines = [];

// Raycaster for click detection
let raycaster, mouse;
let selectedStart = null;
let selectedEnd = null;
let selectionMode = 'start'; // 'start' or 'end'

// Chart instances
let comparisonChart = null;
let metricsChart = null;
let radarChart = null;
let efficiencyChart = null;

// Store last results for dashboard
let lastResults = null;

// Time and space complexity info for each algorithm
const TIME_COMPLEXITY = {
    classical: 'O((V+E) log V)',
    cognitive: 'O((V+E) log V)',
    astar: 'O(E)',  // Best case with good heuristic
    bellman: 'O(V × E)'
};

const SPACE_COMPLEXITY = {
    classical: 'O(V + E)',
    cognitive: 'O(V + E)',
    astar: 'O(V)',
    bellman: 'O(V)'
};

const COLORS = {
    classical: 0xFF3333,   // Neon Red
    modified: 0x00FFFF,    // Neon Blue (Cognitive)
    astar: 0x00FF88,       // Neon Green
    bellman: 0xFFFF00,     // Neon Yellow
    traversal: 0xFF00FF,   // Neon Pink for traversal flash
    defaultNode: 0x666666,
    selectedStart: 0x00FF00, // Bright green for start
    selectedEnd: 0xFF0000,   // Bright red for end
    defaultEdge: 0x4488AA,
    stairEdge: 0xFF8800
};

function init3D() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1A1A24, 0.002);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(60, 40, 60);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(100, 0, 100);

    // Raycaster for node selection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Neon Grid Floor
    const gridHelper1 = new THREE.GridHelper(400, 80, 0x005555, 0x002222);
    gridHelper1.position.set(100, 0, 100);
    scene.add(gridHelper1);

    // Floor 2 grid
    const gridHelper2 = new THREE.GridHelper(400, 80, 0x330033, 0x110011);
    gridHelper2.position.set(100, 12, 100);
    scene.add(gridHelper2);

    window.addEventListener('resize', onWindowResize, false);
    
    // Click to select nodes
    container.addEventListener('click', onCanvasClick, false);
    
    // Hover for tooltips
    container.addEventListener('mousemove', onCanvasHover, false);

    // Scroll hint click
    document.getElementById('scroll-hint').addEventListener('click', () => {
        document.getElementById('dashboard-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Fetch initial map and weights
    Promise.all([
        fetch('http://127.0.0.1:5000/map').then(r => r.json()),
        fetch('http://127.0.0.1:5000/weights').then(r => r.json())
    ]).then(([mapData, weightData]) => {
        buildMap(mapData);
        populateResearchSection(weightData);
    }).catch(e => console.error("Error loading data:", e));

    animate();
}

function onWindowResize() {
    const sandbox = document.getElementById('sandbox-section');
    camera.aspect = sandbox.clientWidth / sandbox.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sandbox.clientWidth, sandbox.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Node selection via click
function onCanvasClick(event) {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshes = Object.values(nodeMeshes);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const nodeId = Object.keys(nodeMeshes).find(id => nodeMeshes[id] === clickedMesh);
        
        if (nodeId) {
            if (selectionMode === 'start') {
                // Clear previous start selection
                if (selectedStart && nodeMeshes[selectedStart]) {
                    nodeMeshes[selectedStart].material.color.setHex(COLORS.defaultNode);
                    nodeMeshes[selectedStart].scale.set(1, 1, 1);
                }
                selectedStart = nodeId;
                document.getElementById('start-node').value = nodeId;
                clickedMesh.material.color.setHex(COLORS.selectedStart);
                clickedMesh.scale.set(1.8, 1.8, 1.8);
                selectionMode = 'end';
            } else {
                // Clear previous end selection
                if (selectedEnd && nodeMeshes[selectedEnd]) {
                    nodeMeshes[selectedEnd].material.color.setHex(COLORS.defaultNode);
                    nodeMeshes[selectedEnd].scale.set(1, 1, 1);
                }
                selectedEnd = nodeId;
                document.getElementById('end-node').value = nodeId;
                clickedMesh.material.color.setHex(COLORS.selectedEnd);
                clickedMesh.scale.set(1.8, 1.8, 1.8);
                selectionMode = 'start';
            }
        }
    }
}

// Tooltip on hover
function onCanvasHover(event) {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshes = Object.values(nodeMeshes);
    const intersects = raycaster.intersectObjects(meshes);
    
    let tooltip = document.getElementById('node-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'node-tooltip';
        document.body.appendChild(tooltip);
    }
    
    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const nodeId = Object.keys(nodeMeshes).find(id => nodeMeshes[id] === hoveredMesh);
        
        if (nodeId) {
            const node = nodesData[nodeId];
            const floor = node.position.z > 3 ? 2 : 1;
            
            // Find all edges connected to this node
            const connectedEdges = edgesData.filter(e => e.from === nodeId || e.to === nodeId);
            const numConnections = connectedEdges.length;
            
            // Calculate totals for this node's connections
            let totalDist = 0, totalTurns = 0, totalStairs = 0, totalJunctions = 0;
            const neighbors = [];
            
            connectedEdges.forEach(e => {
                const neighbor = e.from === nodeId ? e.to : e.from;
                if (!neighbors.includes(neighbor)) {
                    neighbors.push(neighbor);
                    totalDist += e.distance || 0;
                    totalTurns += e.turn_penalty || 0;
                    totalStairs += e.stairs_penalty || 0;
                    totalJunctions += e.junction_penalty || 0;
                }
            });
            
            // Check if this is a stairwell node
            const hasStairs = connectedEdges.some(e => (e.stairs_penalty || 0) > 0);
            
            tooltip.innerHTML = `
                <div style="font-size: 14px; margin-bottom: 5px;"><strong>NODE ${nodeId}</strong></div>
                <div>Floor: ${floor} ${hasStairs ? '🚶 Stairwell' : ''}</div>
                <div>Connections: ${neighbors.length}</div>
                <hr style="border-color: #333; margin: 5px 0;">
                <div style="font-size: 11px; color: #aaa;">Avg Edge Stats:</div>
                <div>📏 Distance: ${neighbors.length ? (totalDist / neighbors.length).toFixed(1) : 0}</div>
                <div>↩️ Turns: ${neighbors.length ? (totalTurns / neighbors.length).toFixed(1) : 0}</div>
                <div>🪜 Stairs: ${neighbors.length ? (totalStairs / neighbors.length).toFixed(1) : 0}</div>
                <div>🔀 Junctions: ${neighbors.length ? (totalJunctions / neighbors.length).toFixed(1) : 0}</div>
                <hr style="border-color: #333; margin: 5px 0;">
                <div style="font-size: 10px; color: #666;">Connected to: ${neighbors.slice(0, 5).join(', ')}${neighbors.length > 5 ? '...' : ''}</div>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    } else {
        tooltip.style.display = 'none';
    }
}

function clearScene() {
    Object.values(nodeMeshes).forEach(mesh => {
        scene.remove(mesh);
        if (mesh.userData.sprite) scene.remove(mesh.userData.sprite);
    });
    edgeLines.forEach(line => scene.remove(line));
    clearPathLines();

    nodeMeshes = {};
    edgeLines = [];
}

function clearPathLines() {
    [classicalPathLines, modifiedPathLines, astarPathLines, bellmanPathLines].forEach(arr => {
        arr.forEach(line => scene.remove(line));
    });
    classicalPathLines = [];
    modifiedPathLines = [];
    astarPathLines = [];
    bellmanPathLines = [];
}

function getPos(nodeId) {
    const node = nodesData[nodeId];
    if (!node) {
        console.error("Node not found:", nodeId);
        return new THREE.Vector3(0, 0, 0);
    }
    const n = node.position;
    return new THREE.Vector3(n.x, n.z * 2, n.y);
}

function buildMap(mapData) {
    nodesData = mapData.nodes;
    edgesData = mapData.edges;
    clearScene();

    const sphereGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const defaultMat = new THREE.MeshBasicMaterial({ color: COLORS.defaultNode, transparent: true, opacity: 0.8 });

    for (const [id, node] of Object.entries(nodesData)) {
        const mesh = new THREE.Mesh(sphereGeo, defaultMat.clone());
        const pos = getPos(id);
        mesh.position.copy(pos);
        scene.add(mesh);
        nodeMeshes[id] = mesh;

        // Label sprite
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.font = "Bold 36px Orbitron";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(id, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(pos);
        sprite.position.y += 3;
        sprite.scale.set(6, 6, 1);
        scene.add(sprite);
        mesh.userData.sprite = sprite;
    }

    // Draw Edges
    const drawnEdges = new Set();
    edgesData.forEach(edge => {
        const sortedNodes = [edge.from, edge.to].sort((a, b) => parseInt(a) - parseInt(b));
        const edgeId = sortedNodes.join('-');
        if (drawnEdges.has(edgeId)) return;
        drawnEdges.add(edgeId);

        const pos1 = getPos(edge.from);
        const pos2 = getPos(edge.to);

        let color = COLORS.defaultEdge;
        if (edge.stairs_penalty > 0) color = COLORS.stairEdge;

        const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const geometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
        const line = new THREE.Line(geometry, material);
        // Store edge data for hover detection
        line.userData = {
            from: edge.from,
            to: edge.to,
            distance: edge.distance || 0,
            turns: edge.turn_penalty || 0,
            stairs: edge.stairs_penalty || 0,
            junctions: edge.junction_penalty || 0,
            originalColor: color,
            originalOpacity: 0.5
        };
        scene.add(line);
        edgeLines.push(line);
    });
    
    console.log("Rendered " + drawnEdges.size + " edges and " + Object.keys(nodeMeshes).length + " nodes");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function animateTraversal(traversalArray, pathArray, color, pathLinesArray) {
    for (const nodeId of traversalArray) {
        if (!nodeMeshes[nodeId]) continue;
        const mat = nodeMeshes[nodeId].material;
        mat.color.setHex(COLORS.traversal);
        await sleep(16);
        mat.color.setHex(COLORS.defaultNode);
    }

    const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 1.0 });
    for (let i = 0; i < pathArray.length - 1; i++) {
        const p1 = getPos(pathArray[i]);
        const p2 = getPos(pathArray[i + 1]);
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        pathLinesArray.push(line);
    }

    pathArray.forEach(nodeId => {
        if (nodeMeshes[nodeId]) {
            nodeMeshes[nodeId].material.color.setHex(color);
            nodeMeshes[nodeId].scale.set(1.5, 1.5, 1.5);
        }
    });
}

function formatMetrics(metrics) {
    return `
        <div class="stat-row"><span>Total Distance:</span> <span class="stat-value">${metrics.totalDistance}</span></div>
        <div class="stat-row"><span>Sharp Turns:</span> <span class="stat-value">${metrics.totalTurns}</span></div>
        <div class="stat-row"><span>Stairs Used:</span> <span class="stat-value">${metrics.totalStairs}</span></div>
        <div class="stat-row"><span>Junctions:</span> <span class="stat-value">${metrics.totalJunctions}</span></div>
        <div class="stat-row"><span>Cognitive Weight:</span> <span class="stat-value">${metrics.totalWeight}</span></div>
    `;
}

function updateVisibility() {
    const showClass = document.getElementById('toggle-classical').checked;
    const showMod = document.getElementById('toggle-modified').checked;
    const showAstar = document.getElementById('toggle-astar').checked;
    const showBellman = document.getElementById('toggle-bellman').checked;

    classicalPathLines.forEach(l => l.visible = showClass);
    modifiedPathLines.forEach(l => l.visible = showMod);
    astarPathLines.forEach(l => l.visible = showAstar);
    bellmanPathLines.forEach(l => l.visible = showBellman);
}

function togglePanel(id) {
    const panel = document.getElementById(id);
    panel.classList.toggle('hidden');
}

function clearPathLines() {
    [classicalPathLines, modifiedPathLines, astarPathLines, bellmanPathLines].forEach(lines => {
        lines.forEach(l => scene.remove(l));
        lines.length = 0;
    });
}

// Populate research section from API
function populateResearchSection(weightData) {
    const container = document.getElementById('research-citations');
    if (!weightData.citations) return;
    
    container.innerHTML = weightData.citations.map(c => `
        <div class="research-item">
            <h4>${c.factor}</h4>
            <div class="weight">×${c.weight}</div>
            <div class="citation">${c.citation}</div>
            <div class="finding">${c.finding}</div>
        </div>
    `).join('');
}

// Update dashboard charts
function updateDashboard(data) {
    lastResults = data;
    
    // Update results table
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = `
        <tr>
            <td class="algo-classical">Classical Dijkstra</td>
            <td>${data.classicalMetrics.totalDistance}</td>
            <td>${data.classicalMetrics.totalTurns}</td>
            <td>${data.classicalMetrics.totalStairs}</td>
            <td>${data.classicalMetrics.totalJunctions}</td>
            <td>${data.classicalMetrics.totalWeight}</td>
            <td>${data.classicalPath.length}</td>
            <td>${data.classicalTraversal.length}</td>
            <td><code>${TIME_COMPLEXITY.classical}</code></td>
            <td><code>${SPACE_COMPLEXITY.classical}</code></td>
        </tr>
        <tr>
            <td class="algo-cognitive">Cognitive Dijkstra</td>
            <td>${data.modifiedMetrics.totalDistance}</td>
            <td>${data.modifiedMetrics.totalTurns}</td>
            <td>${data.modifiedMetrics.totalStairs}</td>
            <td>${data.modifiedMetrics.totalJunctions}</td>
            <td>${data.modifiedMetrics.totalWeight}</td>
            <td>${data.modifiedPath.length}</td>
            <td>${data.modifiedTraversal.length}</td>
            <td><code>${TIME_COMPLEXITY.cognitive}</code></td>
            <td><code>${SPACE_COMPLEXITY.cognitive}</code></td>
        </tr>
        <tr>
            <td class="algo-astar">A* Algorithm</td>
            <td>${data.astarMetrics.totalDistance}</td>
            <td>${data.astarMetrics.totalTurns}</td>
            <td>${data.astarMetrics.totalStairs}</td>
            <td>${data.astarMetrics.totalJunctions}</td>
            <td>${data.astarMetrics.totalWeight}</td>
            <td>${data.astarPath.length}</td>
            <td>${data.astarTraversal.length}</td>
            <td><code>${TIME_COMPLEXITY.astar}</code></td>
            <td><code>${SPACE_COMPLEXITY.astar}</code></td>
        </tr>
        <tr>
            <td class="algo-bellman">Bellman-Ford</td>
            <td>${data.bellmanMetrics.totalDistance}</td>
            <td>${data.bellmanMetrics.totalTurns}</td>
            <td>${data.bellmanMetrics.totalStairs}</td>
            <td>${data.bellmanMetrics.totalJunctions}</td>
            <td>${data.bellmanMetrics.totalWeight}</td>
            <td>${data.bellmanPath.length}</td>
            <td>${data.bellmanTraversal.length}</td>
            <td><code>${TIME_COMPLEXITY.bellman}</code></td>
            <td><code>${SPACE_COMPLEXITY.bellman}</code></td>
        </tr>
    `;

    // Chart colors
    const chartColors = {
        classical: 'rgba(255, 51, 51, 0.8)',
        cognitive: 'rgba(0, 255, 255, 0.8)',
        astar: 'rgba(0, 255, 136, 0.8)',
        bellman: 'rgba(255, 255, 0, 0.8)'
    };

    // Comparison Chart (Cognitive Weight)
    const compCtx = document.getElementById('comparison-chart').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(compCtx, {
        type: 'bar',
        data: {
            labels: ['Classical Dijkstra', 'Cognitive Dijkstra', 'A* Algorithm', 'Bellman-Ford'],
            datasets: [{
                label: 'Cognitive Weight',
                data: [
                    data.classicalMetrics.totalWeight,
                    data.modifiedMetrics.totalWeight,
                    data.astarMetrics.totalWeight,
                    data.bellmanMetrics.totalWeight
                ],
                backgroundColor: [chartColors.classical, chartColors.cognitive, chartColors.astar, chartColors.bellman],
                borderColor: [chartColors.classical, chartColors.cognitive, chartColors.astar, chartColors.bellman],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Total Cognitive Weight Comparison', color: '#fff' }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#aaa' } },
                x: { grid: { color: '#333' }, ticks: { color: '#aaa' } }
            }
        }
    });

    // Metrics Breakdown Chart
    const metricsCtx = document.getElementById('metrics-chart').getContext('2d');
    if (metricsChart) metricsChart.destroy();
    metricsChart = new Chart(metricsCtx, {
        type: 'bar',
        data: {
            labels: ['Distance', 'Turns', 'Stairs', 'Junctions'],
            datasets: [
                {
                    label: 'Classical',
                    data: [data.classicalMetrics.totalDistance, data.classicalMetrics.totalTurns, data.classicalMetrics.totalStairs, data.classicalMetrics.totalJunctions],
                    backgroundColor: chartColors.classical
                },
                {
                    label: 'Cognitive',
                    data: [data.modifiedMetrics.totalDistance, data.modifiedMetrics.totalTurns, data.modifiedMetrics.totalStairs, data.modifiedMetrics.totalJunctions],
                    backgroundColor: chartColors.cognitive
                },
                {
                    label: 'A*',
                    data: [data.astarMetrics.totalDistance, data.astarMetrics.totalTurns, data.astarMetrics.totalStairs, data.astarMetrics.totalJunctions],
                    backgroundColor: chartColors.astar
                },
                {
                    label: 'Bellman-Ford',
                    data: [data.bellmanMetrics.totalDistance, data.bellmanMetrics.totalTurns, data.bellmanMetrics.totalStairs, data.bellmanMetrics.totalJunctions],
                    backgroundColor: chartColors.bellman
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#aaa' } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#aaa' } },
                x: { grid: { color: '#333' }, ticks: { color: '#aaa' } }
            }
        }
    });

    // Radar Chart (Cognitive Profile) - Classical vs Cognitive
    const radarCtx = document.getElementById('radar-chart').getContext('2d');
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Distance', 'Turns', 'Stairs', 'Junctions', 'Path Length'],
            datasets: [
                {
                    label: 'Classical',
                    data: [
                        data.classicalMetrics.totalDistance,
                        data.classicalMetrics.totalTurns * 10,
                        data.classicalMetrics.totalStairs * 20,
                        data.classicalMetrics.totalJunctions * 5,
                        data.classicalPath.length * 5
                    ],
                    borderColor: chartColors.classical,
                    backgroundColor: 'rgba(255, 51, 51, 0.2)'
                },
                {
                    label: 'Cognitive',
                    data: [
                        data.modifiedMetrics.totalDistance,
                        data.modifiedMetrics.totalTurns * 10,
                        data.modifiedMetrics.totalStairs * 20,
                        data.modifiedMetrics.totalJunctions * 5,
                        data.modifiedPath.length * 5
                    ],
                    borderColor: chartColors.cognitive,
                    backgroundColor: 'rgba(0, 255, 255, 0.2)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#aaa' } }
            },
            scales: {
                r: {
                    angleLines: { color: '#444' },
                    grid: { color: '#333' },
                    pointLabels: { color: '#aaa' },
                    ticks: { display: false }
                }
            }
        }
    });

    // Efficiency Chart (Scatter: Nodes Visited vs Cognitive Weight)
    const effCtx = document.getElementById('efficiency-chart').getContext('2d');
    if (efficiencyChart) efficiencyChart.destroy();
    efficiencyChart = new Chart(effCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Classical Dijkstra',
                    data: [{ x: data.classicalTraversal.length, y: data.classicalMetrics.totalWeight }],
                    backgroundColor: chartColors.classical,
                    pointRadius: 12,
                    pointHoverRadius: 15
                },
                {
                    label: 'Cognitive Dijkstra',
                    data: [{ x: data.modifiedTraversal.length, y: data.modifiedMetrics.totalWeight }],
                    backgroundColor: chartColors.cognitive,
                    pointRadius: 12,
                    pointHoverRadius: 15
                },
                {
                    label: 'A* Algorithm',
                    data: [{ x: data.astarTraversal.length, y: data.astarMetrics.totalWeight }],
                    backgroundColor: chartColors.astar,
                    pointRadius: 12,
                    pointHoverRadius: 15
                },
                {
                    label: 'Bellman-Ford',
                    data: [{ x: data.bellmanTraversal.length, y: data.bellmanMetrics.totalWeight }],
                    backgroundColor: chartColors.bellman,
                    pointRadius: 12,
                    pointHoverRadius: 15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#aaa' } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x} nodes visited, weight ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Nodes Visited (Efficiency)', color: '#aaa' },
                    grid: { color: '#333' },
                    ticks: { color: '#aaa' }
                },
                y: {
                    title: { display: true, text: 'Cognitive Weight (Path Quality)', color: '#aaa' },
                    grid: { color: '#333' },
                    ticks: { color: '#aaa' }
                }
            }
        }
    });

    // Update Graph Properties
    if (data.graphProperties) {
        document.getElementById('prop-nodes').textContent = data.graphProperties.nodes;
        document.getElementById('prop-edges').textContent = data.graphProperties.edges;
        document.getElementById('prop-density').textContent = data.graphProperties.density;
        document.getElementById('prop-degree').textContent = data.graphProperties.avgDegree;
    }

    // Update Path Similarity Matrix
    if (data.pathSimilarity) {
        const simMatrix = document.getElementById('similarity-matrix');
        const pairs = [
            { key: 'classical_vs_cognitive', label: 'Classical vs Cognitive' },
            { key: 'classical_vs_astar', label: 'Classical vs A*' },
            { key: 'classical_vs_bellman', label: 'Classical vs Bellman' },
            { key: 'cognitive_vs_astar', label: 'Cognitive vs A*' },
            { key: 'cognitive_vs_bellman', label: 'Cognitive vs Bellman' },
            { key: 'astar_vs_bellman', label: 'A* vs Bellman' }
        ];
        
        simMatrix.innerHTML = pairs.map(p => {
            const score = data.pathSimilarity[p.key];
            const scoreClass = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
            return `
                <div class="similarity-item">
                    <div class="pair">${p.label}</div>
                    <div class="score ${scoreClass}">${score}</div>
                </div>
            `;
        }).join('');
    }

    // Update Optimality Guarantees
    if (data.optimality) {
        const optGrid = document.getElementById('optimality-info');
        const algos = [
            { key: 'classical', name: 'Classical Dijkstra' },
            { key: 'cognitive', name: 'Cognitive Dijkstra' },
            { key: 'astar', name: 'A* Algorithm' },
            { key: 'bellman', name: 'Bellman-Ford' }
        ];
        
        optGrid.innerHTML = algos.map(a => {
            const opt = data.optimality[a.key];
            return `
                <div class="optimality-item">
                    <span class="algo-name">${a.name}</span>
                    <span class="guarantee">${opt.guarantee}<br><small style="color:#666">${opt.condition}</small></span>
                    ${opt.optimal ? '<span class="optimal-badge">✓ OPTIMAL</span>' : ''}
                </div>
            `;
        }).join('');
    }

    // Update Memory & Runtime
    if (data.memoryUsage) {
        const memTbody = document.getElementById('memory-tbody');
        const algos = [
            { key: 'classical', name: 'Classical Dijkstra', color: 'algo-classical' },
            { key: 'cognitive', name: 'Cognitive Dijkstra', color: 'algo-cognitive' },
            { key: 'astar', name: 'A* Algorithm', color: 'algo-astar' },
            { key: 'bellman', name: 'Bellman-Ford', color: 'algo-bellman' }
        ];
        
        memTbody.innerHTML = algos.map(a => {
            const mem = data.memoryUsage[a.key];
            return `
                <tr>
                    <td class="${a.color}">${a.name}</td>
                    <td>${formatBytes(mem.estimated_bytes)}</td>
                    <td><strong>${mem.actual_time_ms} ms</strong></td>
                </tr>
            `;
        }).join('');
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function runAlgorithm() {
    const btn = document.querySelector('.cyber-btn');
    btn.innerText = "COMPUTING...";
    btn.disabled = true;

    const start = document.getElementById('start-node').value.toUpperCase();
    const end = document.getElementById('end-node').value.toUpperCase();

    try {
        document.getElementById('results-container').classList.remove('hidden');
        document.getElementById('explanation-text').innerHTML = '<span class="pulsing">GENERATING ANALYSIS...</span>';
        document.getElementById('classical-stats').innerHTML = "";
        document.getElementById('modified-stats').innerHTML = "";

        const res = await fetch(`http://127.0.0.1:5000/run?start=${start}&end=${end}`);
        const data = await res.json();

        if (data.error) {
            alert(data.error);
            btn.innerText = "INITIALIZE ROUTING";
            btn.disabled = false;
            return;
        }

        document.getElementById('results-container').classList.remove('hidden');

        // Reset nodes
        Object.values(nodeMeshes).forEach(m => {
            m.material.color.setHex(COLORS.defaultNode);
            m.scale.set(1, 1, 1);
        });
        clearPathLines();
        selectedStart = null;
        selectedEnd = null;
        selectionMode = 'start';

        // Populate sandbox panels
        document.getElementById('classical-stats').innerHTML =
            formatMetrics(data.classicalMetrics) +
            `<div class="stat-path">[${data.classicalPath.join(' → ')}]</div>`;

        document.getElementById('modified-stats').innerHTML =
            formatMetrics(data.modifiedMetrics) +
            `<div class="stat-path">[${data.modifiedPath.join(' → ')}]</div>`;

        // Typewriter effect
        const explanationText = document.getElementById('explanation-text');
        explanationText.innerHTML = '';
        let typeIdx = 0;
        const textToType = data.explanation;

        function typeWriter() {
            if (typeIdx < textToType.length) {
                explanationText.innerHTML += textToType.charAt(typeIdx);
                typeIdx++;
                setTimeout(typeWriter, 15);
            }
        }
        typeWriter();

        // Animate all algorithms (sequentially for visibility)
        await animateTraversal(data.classicalTraversal, data.classicalPath, COLORS.classical, classicalPathLines);
        await sleep(500);
        
        Object.values(nodeMeshes).forEach(m => m.scale.set(1, 1, 1));
        await animateTraversal(data.modifiedTraversal, data.modifiedPath, COLORS.modified, modifiedPathLines);
        await sleep(500);

        Object.values(nodeMeshes).forEach(m => m.scale.set(1, 1, 1));
        await animateTraversal(data.astarTraversal, data.astarPath, COLORS.astar, astarPathLines);
        await sleep(500);

        Object.values(nodeMeshes).forEach(m => m.scale.set(1, 1, 1));
        await animateTraversal(data.bellmanTraversal, data.bellmanPath, COLORS.bellman, bellmanPathLines);

        updateVisibility();
        
        // Update dashboard
        updateDashboard(data);

    } catch (e) {
        alert("Error connecting to backend: " + e.message);
    }

    btn.innerText = "INITIALIZE ROUTING";
    btn.disabled = false;
}

// Init
window.onload = init3D;