# Cognitive-Aware Dijkstra for Indoor Pathfinding

<<<<<<< HEAD
A research/demo system for **indoor navigation** that compares:
=======
A research/demo system for indoor navigation that compares:
>>>>>>> e322968 (readme)

- **Classical Dijkstra** (distance-only shortest path), vs.
- **Cognitive-Aware Dijkstra** (distance + penalties for turns, stairs, and decision-heavy junctions)

<<<<<<< HEAD
The backend exposes a clean **Flask API** that computes both routes for the same start/end nodes and returns:
- the **paths**
- the **node-expansion traversal order** (for animation)
- **route metrics** (distance, turns, stairs, junctions)
- a **cognitive weight score**
- an **explainability summary** (optionally generated with the Anthropic API)

A **Three.js “cyberpunk” frontend** visualizes a **100-node, 2-floor 3D graph** and animates traversal and final paths.
=======
The backend exposes a clean Flask API that computes both routes for the same start/end nodes and returns:

- the paths
- the node-expansion traversal order (for animation)
- route metrics (distance, turns, stairs, junctions)
- a cognitive weight score
- an explainability summary (optionally generated with the Anthropic API)

A **Three.js "cyberpunk" frontend** visualizes a 100-node, 2-floor 3D graph and animates traversal and final paths.
>>>>>>> e322968 (readme)

---

## Motivation

<<<<<<< HEAD
Indoor navigation is not only a geometry problem—it's also a human factors problem.

A route that is **shortest in meters** can still be frustrating if it requires:
- many turns (wayfinding effort),
- stairs (physical effort/accessibility constraints),
- repeated junction decisions (cognitive load and error-proneness).

This project demonstrates a simple practical approach:  
=======
Indoor navigation is not only a geometry problem—it's also a **human factors** problem.

A route that is shortest in meters can still be frustrating if it requires:

- many **turns** (wayfinding effort),
- **stairs** (physical effort/accessibility constraints),
- repeated **junction decisions** (cognitive load and error-proneness).

This project demonstrates a simple practical approach:
>>>>>>> e322968 (readme)
**optimize the route cost function to better match how humans experience indoor navigation.**

---

## Key idea: Cognitive edge weighting

Each edge in the indoor graph can include:

- `distance`
- `turn_penalty`
- `stairs_penalty`
- `junction_penalty`

The cognitive-aware edge weight is:

<<<<<<< HEAD
\[
w = distance + \alpha\cdot turns + \beta\cdot stairs + \gamma\cdot junctions
\]

Recommended coefficients used in the project description:

- **α = 2** (turn penalty coefficient)
- **β = 4** (stairs penalty coefficient)
- **γ = 1** (junction penalty coefficient)
=======
$$w = \text{distance} + \alpha \cdot \text{turns} + \beta \cdot \text{stairs} + \gamma \cdot \text{junctions}$$

Recommended coefficients used in this project:

| Coefficient | Value | Purpose |
|-------------|-------|---------|
| α | 2 | Turn penalty multiplier |
| β | 4 | Stairs penalty multiplier |
| γ | 1 | Junction penalty multiplier |
>>>>>>> e322968 (readme)

This turns Dijkstra into a **multi-factor optimization** that can prefer slightly longer corridors if they reduce wayfinding effort.

---

## What this repository contains

### Backend (Flask, Python)
<<<<<<< HEAD
The backend computes both algorithms and returns results in a single response for easy comparison and visualization.

**Core endpoints**
- `GET /`  
  Health check / quick hint
- `GET /map`  
  Returns the embedded/generated indoor map (nodes + edges)
- `GET /run?start=<id>&end=<id>`  
  Runs both classical and cognitive Dijkstra and returns:
  - `classicalPath`, `modifiedPath`
  - `classicalMetrics`, `modifiedMetrics`
  - `classicalTraversal`, `modifiedTraversal`
  - `explanation`
  - `map` (so the frontend renders the exact same graph)

### Frontend (Three.js)
The UI provides:
- start/end node inputs (defaults `1 → 100`)
=======

The backend computes both algorithms and returns results in a single response for easy comparison and visualization.

#### Core endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check / quick hint |
| `GET /map` | Returns the embedded/generated indoor map (nodes + edges) |
| `GET /run?start=<id>&end=<id>` | Runs both classical and cognitive Dijkstra and returns: `classicalPath`, `modifiedPath`, `classicalMetrics`, `modifiedMetrics`, `classicalTraversal`, `modifiedTraversal`, `explanation`, `map` |

### Frontend (Three.js)

The UI provides:

- start/end node inputs (defaults `1` → `100`)
>>>>>>> e322968 (readme)
- toggles for classical path / modified path / explanation panel
- animated traversal visualization (node expansion flashing)
- neon-styled results panels showing route metrics and cognitive weight

---

## Repository structure

<<<<<<< HEAD
```text
.
├── backend/
│   ├── app.py                      # Flask API: /map and /run
=======
```
.
├── backend/
│   ├── app.py                       # Flask API: /map and /run
>>>>>>> e322968 (readme)
│   ├── classical_dijkstra.py        # Distance-only Dijkstra
│   ├── classical_weights.py         # Edge weight = distance
│   ├── cognitive_weights.py         # Edge weight = distance + penalties
│   ├── dijkstra.py                  # Modified Dijkstra using cognitive weights
│   ├── embedded_map.py              # Cached 100-node, 2-floor map generator
│   ├── explanation_generator.py     # Anthropic-based explanation with fallback
│   ├── graph_builder.py             # Builds adjacency list from map JSON
│   ├── metrics_calculator.py        # Aggregates metrics and cognitive weight
│   ├── traversal_logger.py          # Captures node expansion order for animation
│   └── __init__.py
├── data/
<<<<<<< HEAD
│   └── map.json                     # Small example map (A-D) (not the 100-node generator)
=======
│   └── map.json                     # Small example map (A-D)
>>>>>>> e322968 (readme)
├── frontend/
│   ├── index.html                   # UI + toggles + panels
│   ├── script.js                    # Three.js rendering + API calls + animations
│   └── style.css                    # Cyberpunk styling
├── requirements.txt
└── main.py                          # Placeholder (currently empty)
```

---

## How it works (end-to-end)

1. The backend provides a cached indoor map via `GET /map`.
2. The frontend fetches the map, renders nodes/edges in 3D, and labels nodes.
3. When you run routing (`GET /run?start=...&end=...`):
   - **Classical Dijkstra** computes the path minimizing distance only.
   - **Cognitive Dijkstra** computes the path minimizing the cognitive weight function.
<<<<<<< HEAD
4. The backend computes and returns route metrics and an explanation.
5. The frontend animates:
   - traversal order (expansion flashes)
   - final classical path (neon red)
   - final cognitive path (neon blue)
=======
   - The backend computes and returns route metrics and an explanation.
4. The frontend animates:
   - traversal order (expansion flashes)
   - final classical path (**neon red**)
   - final cognitive path (**neon blue**)
>>>>>>> e322968 (readme)

---

## Setup

### Prerequisites
<<<<<<< HEAD
- Python 3.9+ recommended
- A modern browser (for WebGL / Three.js)
- Optional: an Anthropic API key for AI explanations

---

## Running the backend (Flask API)

### 1) Install dependencies
=======

- Python 3.9+ recommended
- A modern browser (for WebGL / Three.js)
- Optional: an [Anthropic API key](https://console.anthropic.com/) for AI explanations

### Running the backend (Flask API)

#### 1) Install dependencies

>>>>>>> e322968 (readme)
```bash
pip install -r requirements.txt
```

<<<<<<< HEAD
> Note: `backend/app.py` imports `flask_cors`, and `backend/explanation_generator.py` imports `dotenv` and `anthropic`.
> If your environment does not already include these packages, add/install:
> - `flask-cors`
> - `python-dotenv`
> - `anthropic`

### 2) Start the server
Run from the `backend/` directory (recommended due to local imports):
=======
> **Note:** `backend/app.py` imports `flask_cors`, and `backend/explanation_generator.py` imports `dotenv` and `anthropic`. If your environment does not already include these packages, add/install:
> ```bash
> pip install flask-cors python-dotenv anthropic
> ```

#### 2) Start the server

Run from the `backend/` directory (recommended due to local imports):

>>>>>>> e322968 (readme)
```bash
cd backend
python app.py
```

The backend will be available at:
<<<<<<< HEAD
- `http://127.0.0.1:5000`

### 3) Quick API checks
=======

```
http://127.0.0.1:5000
```

#### 3) Quick API checks

>>>>>>> e322968 (readme)
```bash
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/map
curl "http://127.0.0.1:5000/run?start=1&end=100"
```

<<<<<<< HEAD
---

## Running the frontend (Three.js)

The frontend expects the backend to be running at:
- `http://127.0.0.1:5000`

### Option A: Use Python’s static server
=======
### Running the frontend (Three.js)

The frontend expects the backend to be running at `http://127.0.0.1:5000`.

**Option A: Use Python's static server**

>>>>>>> e322968 (readme)
```bash
cd frontend
python -m http.server 8000
```

<<<<<<< HEAD
Then open:
- `http://127.0.0.1:8000`

### What you should see
- A neon grid / 3D scene with labeled nodes
- Controls to run routing
- Two results panels (classical vs modified) with metrics
- An explanation panel with a “typewriter” effect
=======
Then open: `http://127.0.0.1:8000`

**Option B: Open directly**

Open `frontend/index.html` directly in your browser (some browsers may block local CORS—Option A is safer).

### What you should see

- A neon grid / 3D scene with labeled nodes
- Controls to run routing
- Two results panels (classical vs modified) with metrics
- An explanation panel with a "typewriter" effect
>>>>>>> e322968 (readme)

---

## Data model

### Nodes
<<<<<<< HEAD
The 100-node generator emits nodes with a 3D position:
=======

The 100-node generator emits nodes with a 3D position:

>>>>>>> e322968 (readme)
```json
{
  "id": "42",
  "position": { "x": 120, "y": 80, "z": 0 }
}
```

<<<<<<< HEAD
### Edges
Edges support multi-factor penalty fields:
=======
- `z = 0` → Ground floor
- `z = 6` → First floor

### Edges

Edges support multi-factor penalty fields:

>>>>>>> e322968 (readme)
```json
{
  "from": "45",
  "to": "55",
  "distance": 10,
  "turn_penalty": 1,
  "stairs_penalty": 1,
  "junction_penalty": 0
}
```

<<<<<<< HEAD
---

## Metrics reported

For each computed route, the backend returns:

- `totalDistance`
- `totalTurns`
- `totalStairs`
- `totalJunctions`
- `totalWeight` (computed cognitive cost)

This enables an apples-to-apples comparison of routes:
- classical may be shorter in `totalDistance`
- cognitive-aware may be lower in `totalWeight` by avoiding costly features
=======
### Metrics reported

For each computed route, the backend returns:

| Metric | Description |
|--------|-------------|
| `totalDistance` | Sum of edge distances along the path |
| `totalTurns` | Sum of turn penalties |
| `totalStairs` | Sum of stair penalties |
| `totalJunctions` | Sum of junction penalties |
| `totalWeight` | Computed cognitive cost using the weight formula |

This enables an apples-to-apples comparison of routes:

- **classical** may be shorter in `totalDistance`
- **cognitive-aware** may be lower in `totalWeight` by avoiding costly features
>>>>>>> e322968 (readme)

---

## Explainability (AI + fallback)

The backend can generate an explanation comparing the two routes.

### Option 1: Anthropic-powered explanation
<<<<<<< HEAD
Create `backend/.env`:
=======

Create `backend/.env`:

>>>>>>> e322968 (readme)
```env
ANTHROPIC_API_KEY=your_key_here
```

When enabled, the backend prompts the model to:
<<<<<<< HEAD
=======

>>>>>>> e322968 (readme)
- compare both routes,
- cite numeric metric differences,
- and produce a short cyberpunk-style narrative.

### Option 2: Built-in deterministic fallback
<<<<<<< HEAD
If no key is configured (or the call fails), the backend returns a structured fallback explanation.
=======

If no key is configured (or the call fails), the backend returns a structured fallback explanation listing the cognitive factors that differ between routes.
>>>>>>> e322968 (readme)

---

## Implementation notes (for developers)

### Map generation
<<<<<<< HEAD
`backend/embedded_map.py`:
- generates a 100-node building-like grid across 2 floors,
- adds stairwell connectors,
- and injects “contrast routes”:
  - a shorter but cognitively complex “shortcut”
  - a longer but simpler “easy path”
=======

`backend/embedded_map.py`:

- generates a **100-node building-like grid** across 2 floors,
- adds **stairwell connectors**,
- and injects **"contrast routes"**:
  - a shorter but cognitively complex "shortcut"
  - a longer but simpler "easy path"
>>>>>>> e322968 (readme)

This makes it easier to observe cases where cognitive-aware routing chooses a different solution than pure distance minimization.

### Traversal animation support
<<<<<<< HEAD
Both Dijkstra implementations log visited nodes via `TraversalLogger`, enabling:
=======

Both Dijkstra implementations log visited nodes via `TraversalLogger`, enabling:

>>>>>>> e322968 (readme)
- step-by-step traversal playback in the frontend
- comparison of exploration behavior between algorithms

---

## Configuration / customization

### Adjust cognitive coefficients (α, β, γ)
<<<<<<< HEAD
Default weighting is implemented in:
- `backend/cognitive_weights.py`

You can tune coefficients to match your use case (e.g., accessibility-first routes can make stairs more expensive).

> Consistency note:
> - `compute_weight()` defaults to α=2, β=4, γ=1.
> - `/run` currently passes `alpha=1` into the modified dijkstra call.
>   If you want strict alignment with α=2 everywhere, update the `/run` call accordingly.

### Plug in a real building map
To use a real dataset:
=======

Default weighting is implemented in:

```
backend/cognitive_weights.py
```

You can tune coefficients to match your use case (e.g., accessibility-first routes can make stairs more expensive).

> **Consistency note:**
> `compute_weight()` defaults to α=2, β=4, γ=1.
> `/run` currently passes `alpha=1` into the modified dijkstra call. If you want strict alignment with α=2 everywhere, update the `/run` call accordingly.

### Plug in a real building map

To use a real dataset:

>>>>>>> e322968 (readme)
- replace the generator in `embedded_map.py` with a loader for your building graph, or
- add an endpoint to upload and cache a custom JSON map

---

<<<<<<< HEAD
## Known limitations / future work

- Dependency list may need expansion for optional features (`flask-cors`, `python-dotenv`, `anthropic`)
- `main.py` is currently a placeholder
- `data/map.json` is a small sample and does not match the 100-node generated graph used by `/map`
- Edge penalties are simple scalar heuristics; future versions could incorporate:
  - accessibility constraints,
  - crowd density,
  - signage confidence,
  - user preferences (stairs avoidance, low-turn preference, etc.)

---

## License

No license file is currently included. If you intend to distribute or publish this project, add an explicit license (e.g., MIT, Apache-2.0).

---

## Acknowledgements

Built as a demonstration of cognitive-load-aware route planning and explainable algorithmic decision-making for indoor navigation.
=======
## License

This project is provided for educational and research purposes.
>>>>>>> e322968 (readme)
