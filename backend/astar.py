"""
A* Algorithm Implementation

A* uses a heuristic function to guide the search toward the goal,
making it more efficient than Dijkstra for single-target pathfinding.

Heuristic: Euclidean distance to goal (admissible - never overestimates)
"""
import heapq
import math
from cognitive_weights import compute_weight


def euclidean_distance(node1, node2):
    """Calculate Euclidean distance between two nodes."""
    pos1 = node1["position"]
    pos2 = node2["position"]
    return math.sqrt(
        (pos1["x"] - pos2["x"]) ** 2 +
        (pos1["y"] - pos2["y"]) ** 2 +
        (pos1["z"] - pos2["z"]) ** 2
    )


def astar(graph, start, goal, nodes, use_cognitive_weights=True, logger=None):
    """
    A* pathfinding algorithm.
    
    Parameters:
    - graph: Adjacency list {node: [edges]}
    - start: Starting node ID
    - goal: Goal node ID
    - nodes: Dict of node positions {id: {x, y, z}}
    - use_cognitive_weights: If True, use cognitive weights; else use distance only
    - logger: TraversalLogger instance for recording visited nodes
    
    Returns:
    - parent: Dict mapping each node to its parent in the shortest path
    """
    if start not in nodes or goal not in nodes:
        return {}
    
    goal_node = nodes[goal]
    
    # Priority queue: (f_score, g_score, node)
    # f_score = g_score + heuristic
    open_set = [(0, 0, start)]
    
    # g_score: cost from start to node
    g_score = {node: float("inf") for node in graph}
    g_score[start] = 0
    
    # f_score: g_score + heuristic
    f_score = {node: float("inf") for node in graph}
    f_score[start] = euclidean_distance(nodes[start], goal_node)
    
    parent = {node: None for node in graph}
    closed_set = set()
    
    while open_set:
        _, current_g, current = heapq.heappop(open_set)
        
        if current in closed_set:
            continue
            
        closed_set.add(current)
        
        if logger:
            logger.log(current)
        
        if current == goal:
            break
        
        for edge in graph[current]:
            neighbor = edge["to"]
            
            if neighbor in closed_set:
                continue
            
            # Calculate edge cost
            if use_cognitive_weights:
                edge_cost = compute_weight(edge)
            else:
                edge_cost = edge.get("distance", 1)
            
            tentative_g = current_g + edge_cost
            
            if tentative_g < g_score[neighbor]:
                parent[neighbor] = current
                g_score[neighbor] = tentative_g
                h = euclidean_distance(nodes[neighbor], goal_node)
                f_score[neighbor] = tentative_g + h
                heapq.heappush(open_set, (f_score[neighbor], tentative_g, neighbor))
    
    return parent
