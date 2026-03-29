from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import time

from graph_builder import build_graph
from dijkstra import dijkstra
from classical_dijkstra import classical_dijkstra
from astar import astar
from bellman_ford import bellman_ford
from traversal_logger import TraversalLogger
from embedded_map import get_embedded_map
from metrics_calculator import calculate_metrics
from explanation_generator import generate_explanation
from cognitive_weights import get_weight_info

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend is running. Use /run?start=A&end=F to execute the algorithm."

@app.route("/map", methods=["GET"])
def get_map():
    return jsonify(get_embedded_map())

@app.route("/weights", methods=["GET"])
def get_weights():
    """Return research-backed weight information."""
    return jsonify(get_weight_info())

@app.route("/run", methods=["GET"])
def run():
    # Parse URL args
    start_node = request.args.get("start", "A").upper()
    end_node = request.args.get("end", "Z").upper()

    # Load embedded map
    data = get_embedded_map()
    
    # Check valid nodes
    if start_node not in data["nodes"] or end_node not in data["nodes"]:
        return jsonify({"error": "Invalid start or end node"}), 400

    graph = build_graph(data)
    nodes = data["nodes"]  # For A* heuristic
    
    # Helper function to reconstruct path
    def reconstruct_path(parent, start, end):
        path = []
        curr = end
        while curr:
            path.append(curr)
            curr = parent.get(curr)
        path.reverse()
        if len(path) == 1 and path[0] != start:
            return []
        return path
    
    # 1. Classical Dijkstra (distance only)
    classical_logger = TraversalLogger()
    t0 = time.perf_counter()
    classical_parent = classical_dijkstra(graph, start_node, logger=classical_logger)
    classical_time = (time.perf_counter() - t0) * 1000  # ms
    classical_path = reconstruct_path(classical_parent, start_node, end_node)

    # 2. Modified Dijkstra (cognitive weights)
    modified_logger = TraversalLogger()
    t0 = time.perf_counter()
    modified_parent = dijkstra(graph, start_node, alpha=1, logger=modified_logger)
    modified_time = (time.perf_counter() - t0) * 1000
    modified_path = reconstruct_path(modified_parent, start_node, end_node)

    # 3. A* with cognitive weights
    astar_logger = TraversalLogger()
    t0 = time.perf_counter()
    astar_parent = astar(graph, start_node, end_node, nodes, use_cognitive_weights=True, logger=astar_logger)
    astar_time = (time.perf_counter() - t0) * 1000
    astar_path = reconstruct_path(astar_parent, start_node, end_node)

    # 4. Bellman-Ford with cognitive weights
    bellman_logger = TraversalLogger()
    t0 = time.perf_counter()
    bellman_parent, has_negative_cycle = bellman_ford(graph, start_node, use_cognitive_weights=True, logger=bellman_logger)
    bellman_time = (time.perf_counter() - t0) * 1000
    bellman_path = reconstruct_path(bellman_parent, start_node, end_node)

    # Calculate metrics for all algorithms
    classical_metrics = calculate_metrics(classical_path, data["edges"])
    modified_metrics = calculate_metrics(modified_path, data["edges"])
    astar_metrics = calculate_metrics(astar_path, data["edges"])
    bellman_metrics = calculate_metrics(bellman_path, data["edges"])
    
    # Prepare all results for recommendation
    all_results = {
        "classical_metrics": classical_metrics,
        "classical_path": classical_path,
        "modified_metrics": modified_metrics,
        "modified_path": modified_path,
        "astar_metrics": astar_metrics,
        "astar_path": astar_path,
        "bellman_metrics": bellman_metrics,
        "bellman_path": bellman_path
    }
    
    # Generate Explanation with recommendation
    explanation = generate_explanation(classical_metrics, modified_metrics, classical_path, modified_path, all_results)

    # Calculate graph properties
    num_nodes = len(data["nodes"])
    num_edges = len(data["edges"]) // 2  # Divide by 2 since edges are bidirectional
    max_possible_edges = num_nodes * (num_nodes - 1) // 2
    density = num_edges / max_possible_edges if max_possible_edges > 0 else 0
    avg_degree = (2 * num_edges) / num_nodes if num_nodes > 0 else 0
    
    graph_properties = {
        "nodes": num_nodes,
        "edges": num_edges,
        "density": round(density, 4),
        "avgDegree": round(avg_degree, 2),
        "maxPossibleEdges": max_possible_edges
    }

    # Calculate path similarity (Jaccard Index)
    def jaccard_similarity(path1, path2):
        if not path1 or not path2:
            return 0
        set1, set2 = set(path1), set(path2)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return round(intersection / union, 3) if union > 0 else 0

    path_similarity = {
        "classical_vs_cognitive": jaccard_similarity(classical_path, modified_path),
        "classical_vs_astar": jaccard_similarity(classical_path, astar_path),
        "classical_vs_bellman": jaccard_similarity(classical_path, bellman_path),
        "cognitive_vs_astar": jaccard_similarity(modified_path, astar_path),
        "cognitive_vs_bellman": jaccard_similarity(modified_path, bellman_path),
        "astar_vs_bellman": jaccard_similarity(astar_path, bellman_path)
    }

    # Memory usage estimates (in terms of data structures)
    # Dijkstra: O(V) for dist + O(V) for parent + O(V) for heap = O(V)
    # A*: O(V) for g_score + O(V) for f_score + O(V) for parent + O(V) for open/closed = O(V)
    # Bellman-Ford: O(V) for dist + O(V) for parent = O(V), but processes O(E) edges V-1 times
    memory_usage = {
        "classical": {
            "space_complexity": "O(V + E)",
            "time_complexity": "O((V+E) log V)",
            "estimated_bytes": num_nodes * 32 + num_edges * 16,
            "actual_time_ms": round(classical_time, 3),
            "structures": "dist[], parent[], priority_queue"
        },
        "cognitive": {
            "space_complexity": "O(V + E)",
            "time_complexity": "O((V+E) log V)",
            "estimated_bytes": num_nodes * 32 + num_edges * 16,
            "actual_time_ms": round(modified_time, 3),
            "structures": "dist[], parent[], priority_queue"
        },
        "astar": {
            "space_complexity": "O(V)",
            "time_complexity": "O(E)",
            "estimated_bytes": num_nodes * 48,
            "actual_time_ms": round(astar_time, 3),
            "structures": "g_score[], f_score[], parent[], open_set, closed_set"
        },
        "bellman": {
            "space_complexity": "O(V)",
            "time_complexity": "O(V × E)",
            "estimated_bytes": num_nodes * 24,
            "actual_time_ms": round(bellman_time, 3),
            "structures": "dist[], parent[]"
        }
    }

    # Optimality guarantees
    optimality = {
        "classical": {
            "optimal": True,
            "guarantee": "Guaranteed optimal for non-negative weights",
            "condition": "All edge weights ≥ 0"
        },
        "cognitive": {
            "optimal": True,
            "guarantee": "Guaranteed optimal for non-negative weights",
            "condition": "All cognitive weights ≥ 0"
        },
        "astar": {
            "optimal": True,
            "guarantee": "Optimal if heuristic is admissible",
            "condition": "h(n) ≤ actual cost to goal (Euclidean distance is admissible)"
        },
        "bellman": {
            "optimal": True,
            "guarantee": "Optimal even with negative weights",
            "condition": "No negative cycles (detected: " + str(has_negative_cycle) + ")"
        }
    }

    return jsonify({
        "map": data,
        # Classical Dijkstra
        "classicalPath": classical_path,
        "classicalWeight": classical_metrics["totalWeight"],
        "classicalMetrics": classical_metrics,
        "classicalTraversal": classical_logger.steps,
        # Modified Dijkstra (Cognitive)
        "modifiedPath": modified_path,
        "modifiedWeight": modified_metrics["totalWeight"],
        "modifiedMetrics": modified_metrics,
        "modifiedTraversal": modified_logger.steps,
        # A* Algorithm
        "astarPath": astar_path,
        "astarWeight": astar_metrics["totalWeight"],
        "astarMetrics": astar_metrics,
        "astarTraversal": astar_logger.steps,
        # Bellman-Ford
        "bellmanPath": bellman_path,
        "bellmanWeight": bellman_metrics["totalWeight"],
        "bellmanMetrics": bellman_metrics,
        "bellmanTraversal": bellman_logger.steps,
        "bellmanHasNegativeCycle": has_negative_cycle,
        # Explanation
        "explanation": explanation,
        # Research info
        "weightInfo": get_weight_info(),
        # Academic features
        "graphProperties": graph_properties,
        "pathSimilarity": path_similarity,
        "memoryUsage": memory_usage,
        "optimality": optimality
    })

if __name__ == "__main__":
    app.run(debug=True)
