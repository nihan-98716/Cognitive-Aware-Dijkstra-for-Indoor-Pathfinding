"""
Bellman-Ford Algorithm Implementation

Bellman-Ford can handle negative edge weights and detect negative cycles.
It's slower than Dijkstra (O(VE) vs O(E log V)) but more versatile.

For cognitive navigation, we use it to demonstrate algorithm comparison
and to handle potential negative weight scenarios (e.g., "bonus" paths).
"""
from cognitive_weights import compute_weight


def bellman_ford(graph, start, use_cognitive_weights=True, logger=None):
    """
    Bellman-Ford shortest path algorithm.
    
    Parameters:
    - graph: Adjacency list {node: [edges]}
    - start: Starting node ID
    - use_cognitive_weights: If True, use cognitive weights; else use distance only
    - logger: TraversalLogger instance for recording visited nodes
    
    Returns:
    - parent: Dict mapping each node to its parent in the shortest path
    - has_negative_cycle: Boolean indicating if negative cycle was detected
    """
    nodes = list(graph.keys())
    n = len(nodes)
    
    # Initialize distances
    dist = {node: float("inf") for node in nodes}
    dist[start] = 0
    parent = {node: None for node in nodes}
    
    # Collect all edges
    all_edges = []
    for u in graph:
        for edge in graph[u]:
            all_edges.append((u, edge))
    
    # Relax edges V-1 times
    for i in range(n - 1):
        updated = False
        for u, edge in all_edges:
            v = edge["to"]
            
            if use_cognitive_weights:
                weight = compute_weight(edge)
            else:
                weight = edge.get("distance", 1)
            
            if dist[u] != float("inf") and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                parent[v] = u
                updated = True
                
                if logger and i == 0:  # Log only on first pass
                    logger.log(v)
        
        # Early termination if no updates
        if not updated:
            break
    
    # Check for negative cycles
    has_negative_cycle = False
    for u, edge in all_edges:
        v = edge["to"]
        
        if use_cognitive_weights:
            weight = compute_weight(edge)
        else:
            weight = edge.get("distance", 1)
        
        if dist[u] != float("inf") and dist[u] + weight < dist[v]:
            has_negative_cycle = True
            break
    
    return parent, has_negative_cycle
