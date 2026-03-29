# 🧭 Cognitive Navigation System

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-orange.svg)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A research-driven indoor navigation system that compares multiple pathfinding algorithms with cognitive load awareness for enhanced human wayfinding.**

This project implements and visualizes four distinct pathfinding algorithms—**Classical Dijkstra**, **Cognitive-Aware Dijkstra**, **A\***, and **Bellman-Ford**—to demonstrate how incorporating cognitive factors (turns, stairs, decision points) produces routes that better align with human navigation preferences.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/Type-Research%20%26%20Demo-blueviolet" alt="Type">
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Motivation](#-motivation)
- [Algorithms Implemented](#-algorithms-implemented)
- [Cognitive Edge Weighting](#-cognitive-edge-weighting)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Data Model](#-data-model)
- [Configuration](#%EF%B8%8F-configuration)
- [Project Structure](#-project-structure)
- [Implementation Details](#-implementation-details)
- [Research Background](#-research-background)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 Overview

Indoor navigation is not merely a geometry problem—it's a **human factors challenge** that requires understanding cognitive load, physical constraints, and wayfinding effort. A route that is shortest in meters may still be frustrating if it requires:

- **Many turns** → Increased wayfinding effort
- **Stairs** → Physical exertion and accessibility barriers
- **Complex junctions** → Cognitive load and error-proneness

The **Cognitive Navigation System** addresses this by implementing multiple pathfinding algorithms and comparing their performance on a **100-node, 2-floor 3D indoor map**. The system provides:

1. **Backend Flask API** - Computes routes using four different algorithms
2. **Interactive 3D Frontend** - Visualizes paths with a cyberpunk-themed Three.js interface
3. **AI-Powered Explanations** - Generates route comparisons using Anthropic''s Claude API
4. **Real-time Animation** - Shows algorithm traversal step-by-step

---

## ✨ Key Features

### 🔬 Multi-Algorithm Comparison
- **Classical Dijkstra**: Pure distance-based shortest path
- **Cognitive-Aware Dijkstra**: Distance + cognitive penalties (turns, stairs, junctions)
- **A\* Algorithm**: Heuristic-guided search using Euclidean distance
- **Bellman-Ford**: Handles negative weights, useful for "bonus" paths

### 🎮 Interactive 3D Visualization
- Real-time **100-node indoor map** rendered in Three.js
- **Cyberpunk-themed UI** with neon effects and glowing paths
- **Click-to-select** nodes directly in the 3D scene
- **Animated traversal** showing algorithm exploration in real-time
- **Dual-floor visualization** (ground and first floor)

### 📊 Comprehensive Metrics
- **Total Distance** - Physical path length
- **Turn Count** - Number of direction changes
- **Stairs Count** - Vertical transitions
- **Junction Count** - Decision points
- **Cognitive Weight** - Composite score incorporating all factors

### 🤖 AI-Powered Explainability
- **Anthropic Claude integration** for natural language route explanations
- **Fallback deterministic explanations** when API unavailable
- **Cyberpunk-styled narratives** comparing route characteristics

### 📈 Visual Analytics
- **Side-by-side comparison panels** for algorithm results
- **Chart.js integration** for metric visualization
- **Color-coded paths**: Red (Classical), Blue (Cognitive), Green (A*), Yellow (Bellman-Ford)

---

## 💡 Motivation

Traditional indoor navigation systems optimize for **geometric distance**, but human wayfinding involves multiple cognitive and physical factors:

### Human Factors in Navigation
1. **Cognitive Load**: Complex routes with many decisions increase mental effort and error rates
2. **Physical Accessibility**: Stairs and elevation changes create barriers
3. **Wayfinding Effort**: Multiple turns require constant re-orientation
4. **Decision Fatigue**: Each junction adds potential for mistakes

### Research-Backed Approach
This project demonstrates that by incorporating these factors into the pathfinding cost function, we can generate routes that are:
- **Easier to follow** (fewer turns and junctions)
- **More accessible** (fewer stairs when alternatives exist)
- **Less mentally taxing** (reduced decision points)
- **Potentially slightly longer** but significantly more user-friendly

---

## 🧮 Algorithms Implemented

### 1. Classical Dijkstra
**Time Complexity**: O((V + E) log V)

Pure distance-based shortest path algorithm. Guarantees the shortest physical distance but ignores cognitive factors.

```python
weight = distance
```

### 2. Cognitive-Aware Dijkstra
**Time Complexity**: O((V + E) log V)

Enhanced Dijkstra that incorporates cognitive penalties into edge weights.

```python
weight = distance + α·turns + β·stairs + γ·junctions
```

### 3. A\* Algorithm
**Time Complexity**: O(E) best case, O(b^d) worst case

Heuristic-guided search using Euclidean distance to goal. More efficient than Dijkstra for single-target pathfinding.

```python
f(n) = g(n) + h(n)
# g(n) = cost from start
# h(n) = Euclidean distance to goal (admissible heuristic)
```

### 4. Bellman-Ford Algorithm
**Time Complexity**: O(VE)

Can handle negative edge weights and detect negative cycles. Useful for scenarios where certain paths provide "bonuses."

```python
# Relaxes all edges V-1 times
# Detects negative cycles with additional iteration
```

---

## 🧠 Cognitive Edge Weighting

Each edge in the indoor graph contains multiple attributes:

```json
{
  "from": "45",
  "to": "55",
  "distance": 10.0,
  "turn_penalty": 1,
  "stairs_penalty": 1,
  "junction_penalty": 0
}
```

### Weight Formula

The cognitive weight is calculated as:

```
w = distance + α·turns + β·stairs + γ·junctions
```

### Default Coefficients

| Coefficient | Value | Purpose | Justification |
|-------------|-------|---------|---------------|
| **α (alpha)** | 2.0 | Turn penalty | Each turn requires re-orientation (2-3 seconds) |
| **β (beta)** | 4.0 | Stairs penalty | Physical effort + accessibility barrier |
| **γ (gamma)** | 1.0 | Junction penalty | Cognitive load from decision-making |

These values are based on wayfinding research and can be adjusted in `backend/cognitive_weights.py`.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Three.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 3D Renderer  │  │ UI Controls  │  │ Animation Engine│  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON
┌──────────────────────────▼──────────────────────────────────┐
│                     Backend (Flask API)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Graph Builder│  │  Algorithms  │  │ Metrics Engine  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Map Generator│  │  Traversal   │  │ AI Explanations │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ Anthropic Claude │
                  │       API        │
                  └──────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.9+** (recommended 3.11+)
- **pip** package manager
- **Modern web browser** with WebGL support (Chrome, Firefox, Edge)
- **Optional**: [Anthropic API key](https://console.anthropic.com/) for AI explanations

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/cognitive-navigation.git
cd cognitive-navigation
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Required packages:**
```bash
pip install flask flask-cors pillow python-dotenv anthropic python-docx
```

### Step 4: Configure Environment (Optional)

For AI-powered explanations, create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

---

## 🎮 Usage

### Running the Backend

```bash
cd backend
python app.py
```

Server starts at `http://127.0.0.1:5000/`

### Running the Frontend

```bash
cd frontend
python -m http.server 8000
```

Open browser: `http://127.0.0.1:8000/`

### Using the Application

1. **Select Start/End Nodes** - Type node IDs (1-100) or click nodes in 3D
2. **Initialize Routing** - Click button to compute paths
3. **View Results** - Toggle algorithms, compare metrics, read explanations
4. **Explore 3D Scene** - Left click rotate, right click pan, scroll zoom

---

## 📡 API Documentation

### Base URL: `http://127.0.0.1:5000`

#### `GET /`
Health check endpoint.

#### `GET /map`
Returns the complete 100-node indoor map structure.

#### `GET /weights`
Returns cognitive weight coefficients and research info.

#### `GET /run?start=<id>&end=<id>`
Executes all algorithms and returns comprehensive results.

**Example:**
```bash
curl "http://127.0.0.1:5000/run?start=1&end=100"
```

**Response includes:**
- `classicalPath`, `classicalMetrics`, `classicalTraversal`
- `modifiedPath`, `modifiedMetrics`, `modifiedTraversal`
- `astarPath`, `astarMetrics`, `astarTraversal`
- `bellmanPath`, `bellmanMetrics`
- `explanation` (AI-generated comparison)
- `map` (complete graph structure)

---

## 📊 Data Model

### Node Structure
```json
{
  "id": "42",
  "position": { "x": 120.0, "y": 80.0, "z": 0.0 }
}
```
- `z = 0`: Ground floor
- `z = 6`: First floor

### Edge Structure
```json
{
  "from": "45",
  "to": "55",
  "distance": 10.0,
  "turn_penalty": 1,
  "stairs_penalty": 1,
  "junction_penalty": 0
}
```

### Metrics Structure
```json
{
  "totalDistance": 125.0,
  "totalTurns": 4,
  "totalStairs": 1,
  "totalJunctions": 2,
  "totalWeight": 119.0
}
```

---

## ⚙️ Configuration

### Adjust Cognitive Coefficients

Edit `backend/cognitive_weights.py`:

```python
def compute_weight(edge, alpha=2.0, beta=4.0, gamma=1.0):
    return (
        edge["distance"] +
        alpha * edge.get("turn_penalty", 0) +
        beta * edge.get("stairs_penalty", 0) +
        gamma * edge.get("junction_penalty", 0)
    )
```

### Custom Map Data

Modify `backend/embedded_map.py` or load custom JSON:

```python
def get_map():
    with open(''data/custom_map.json'') as f:
        return jsonify(json.load(f))
```

---

## 📁 Project Structure

```
cognitive-navigation/
│
├── backend/                          # Flask API server
│   ├── app.py                        # Main Flask application
│   ├── astar.py                      # A* algorithm
│   ├── bellman_ford.py               # Bellman-Ford algorithm
│   ├── classical_dijkstra.py         # Distance-only Dijkstra
│   ├── classical_weights.py          # Classical weight calculation
│   ├── cognitive_weights.py          # Cognitive weight calculation
│   ├── dijkstra.py                   # Cognitive-aware Dijkstra
│   ├── embedded_map.py               # 100-node map generator
│   ├── explanation_generator.py      # AI-powered explanations
│   ├── graph_builder.py              # Graph construction
│   ├── image_generator.py            # Visual generation
│   ├── metrics_calculator.py         # Route metrics
│   ├── traversal_logger.py           # Node exploration tracking
│   └── .env                          # Environment variables
│
├── frontend/                         # Three.js UI
│   ├── index.html                    # Main HTML
│   ├── script.js                     # 3D rendering & API
│   └── style.css                     # Cyberpunk styling
│
├── data/                             # Sample data
│   └── map.json                      # Example map
│
├── requirements.txt                  # Python dependencies
├── generate_report.py                # Report generator
├── README.md                         # This file
├── LICENSE                           # MIT License
└── .gitignore                        # Git ignore rules
```

---

## 🔧 Implementation Details

### Map Generation
- **100-node building** (10×5 grid, 2 floors)
- **4 stairwell connectors** between floors
- **Contrast routes**: shortcut (high cognitive load) vs easy path (low cognitive load)

### Weight Calculation
```python
# Classical: distance only
weight = edge["distance"]

# Cognitive: multi-factor
weight = distance + α·turns + β·stairs + γ·junctions
```

### A\* Heuristic
Uses Euclidean distance (admissible):
```python
h(n) = sqrt((x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²)
```

---

## 📚 Research Background

### Cognitive Load Theory
- **Orientation**: Maintaining directional awareness
- **Decision-making**: Choosing between alternatives
- **Memory**: Recalling route instructions
- **Error recovery**: Correcting mistakes

### Research Citations
- **Klippel et al. (2005)**: Turn penalties (~2-3 seconds per turn)
- **Montello & Sas (2006)**: Stairs consume 2-3× energy
- **Hölscher et al. (2006)**: Junctions increase error by 15-25%

---

## 🤝 Contributing

Contributions welcome! Areas for contribution:
- Additional algorithms (D*, Theta*)
- Real building map importers (GeoJSON, OSM)
- User preference profiles
- Mobile-responsive frontend
- Performance optimization
- Unit tests

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

### Research Foundations
- Dijkstra, E. W. (1959) - Shortest path algorithm
- Hart, P. E. (1968) - A* algorithm
- Klippel, A. (2005) - Wayfinding research
- Montello, D. R. (2006) - Human factors
- Hölscher, C. (2006) - Building navigation

### Technologies
- Flask - Python web framework
- Three.js - WebGL 3D library
- Anthropic Claude - AI explanations
- Chart.js - Visualization

---

## 📞 Contact

- **Issues**: GitHub Issues
- **Email**: your.email@example.com

---

## ❓ FAQ

**Q: Why is the cognitive route longer?**  
A: It trades distance for cognitive load reduction (fewer turns, stairs, decisions).

**Q: Can I use this for real buildings?**  
A: Yes! Replace the map generator with your building''s floor plan data.

**Q: Do I need the Anthropic API?**  
A: No, deterministic explanations are provided as fallback.

**Q: How do I adjust penalties?**  
A: Edit `backend/cognitive_weights.py` and tune α, β, γ coefficients.

---

<p align="center">
  Made with 🧠 for better human navigation
</p>
