import random
import math

# Cache the generated map so results are consistent across requests
_cached_map = None

def generate_random_map(seed=42):
    """Generate a realistic indoor navigation map with 100 nodes."""
    random.seed(seed)
    
    nodes = {}
    
    # Generate 100 nodes spread across the map with more randomization
    # This creates a more natural-looking network
    for i in range(1, 101):
        nid = str(i)
        # Use a mix of grid and random positioning
        base_row = (i - 1) // 10
        base_col = (i - 1) % 10
        
        # Add significant randomization for visual variety
        nodes[nid] = {
            "id": nid,
            "position": {
                "x": base_col * 25 + random.randint(-8, 8),
                "y": base_row * 25 + random.randint(-8, 8),
                "z": 0 if i <= 50 else 6  # Two floors
            }
        }
    
    def euclidean_dist(n1, n2):
        p1, p2 = nodes[n1]["position"], nodes[n2]["position"]
        return math.sqrt((p1["x"]-p2["x"])**2 + (p1["y"]-p2["y"])**2)
    
    def floor_diff(n1, n2):
        return abs(nodes[n1]["position"]["z"] - nodes[n2]["position"]["z"])
    
    def sort_nodes(a, b):
        return (a, b) if int(a) < int(b) else (b, a)
    
    # Build edges dict: key = (u,v) sorted, value = edge properties
    edge_dict = {}
    
    # 1. Connect grid neighbors (horizontal and vertical)
    for i in range(1, 101):
        row = (i - 1) // 10
        col = (i - 1) % 10
        
        # Right neighbor
        if col < 9:
            n1, n2 = str(i), str(i + 1)
            u, v = sort_nodes(n1, n2)
            d = euclidean_dist(n1, n2)
            edge_dict[(u, v)] = {"distance": max(5, round(d)), "turns": random.randint(0, 2), "stairs": 0, "junctions": random.randint(0, 1)}
        
        # Down neighbor
        if row < 9:
            n1, n2 = str(i), str(i + 10)
            u, v = sort_nodes(n1, n2)
            d = euclidean_dist(n1, n2)
            has_stairs = floor_diff(n1, n2) > 0
            edge_dict[(u, v)] = {"distance": max(5, round(d)), "turns": random.randint(0, 2), "stairs": 1 if has_stairs else 0, "junctions": random.randint(0, 1)}
    
    # 2. Add diagonal connections (both directions)
    for i in range(1, 101):
        row = (i - 1) // 10
        col = (i - 1) % 10
        
        # Diagonal down-right
        if col < 9 and row < 9:
            n1, n2 = str(i), str(i + 11)
            u, v = sort_nodes(n1, n2)
            if (u, v) not in edge_dict:
                d = euclidean_dist(n1, n2)
                has_stairs = floor_diff(n1, n2) > 0
                edge_dict[(u, v)] = {"distance": max(5, round(d)), "turns": random.randint(1, 2), "stairs": 1 if has_stairs else 0, "junctions": random.randint(0, 1)}
        
        # Diagonal down-left
        if col > 0 and row < 9:
            n1, n2 = str(i), str(i + 9)
            u, v = sort_nodes(n1, n2)
            if (u, v) not in edge_dict:
                d = euclidean_dist(n1, n2)
                has_stairs = floor_diff(n1, n2) > 0
                edge_dict[(u, v)] = {"distance": max(5, round(d)), "turns": random.randint(1, 2), "stairs": 1 if has_stairs else 0, "junctions": random.randint(0, 1)}
    
    # 3. Add some random long-distance connections for variety
    for _ in range(30):
        n1 = str(random.randint(1, 100))
        n2 = str(random.randint(1, 100))
        if n1 != n2:
            u, v = sort_nodes(n1, n2)
            if (u, v) not in edge_dict:
                d = euclidean_dist(n1, n2)
                if d < 80:  # Only add if reasonably close
                    has_stairs = floor_diff(n1, n2) > 0
                    edge_dict[(u, v)] = {"distance": max(5, round(d)), "turns": random.randint(1, 3), "stairs": 1 if has_stairs else 0, "junctions": random.randint(0, 2)}
    
    # 4. Add stairwell connections between floors
    for col in range(10):
        n1, n2 = str(41 + col), str(51 + col)
        u, v = sort_nodes(n1, n2)
        edge_dict[(u, v)] = {"distance": 8, "turns": 1, "stairs": 1, "junctions": 0}
    
    # Convert to edge list
    edges = []
    for (u, v), props in edge_dict.items():
        edges.append({
            "from": u, "to": v,
            "distance": props["distance"],
            "turn_penalty": props["turns"],
            "stairs_penalty": props["stairs"],
            "junction_penalty": props["junctions"]
        })
        edges.append({
            "from": v, "to": u,
            "distance": props["distance"],
            "turn_penalty": props["turns"],
            "stairs_penalty": props["stairs"],
            "junction_penalty": props["junctions"]
        })
    
    # === SHORTCUT PATH: Short but cognitively complex ===
    # Diagonal path through the grid - shorter distance but complex
    shortcut_nodes = ["1", "12", "23", "34", "45", "56", "67", "78", "89", "100"]
    for i in range(len(shortcut_nodes) - 1):
        u, v = shortcut_nodes[i], shortcut_nodes[i + 1]
        # Remove existing edge if any
        edges = [e for e in edges if not ((e["from"] == u and e["to"] == v) or (e["from"] == v and e["to"] == u))]
        # Add shortcut edge - short distance but HIGH cognitive load (turns and junctions, not stairs)
        # Cognitive weight: 8 + 2*8 + 4*0 + 1*6 = 8+16+0+6 = 30 per edge
        # Total: 9 edges × 30 = 270
        edges.append({
            "from": u, "to": v,
            "distance": 8,
            "turn_penalty": 8,
            "stairs_penalty": 0,
            "junction_penalty": 6
        })
        edges.append({
            "from": v, "to": u,
            "distance": 8,
            "turn_penalty": 8,
            "stairs_penalty": 0,
            "junction_penalty": 6
        })
    
    # === EASY PATH: Longer but cognitively simple ===
    # Along the edges of the grid - longer but simple
    # Cognitive weight: 10 + 0 + 0 + 0 = 10 per edge
    # Total: 18 edges × 10 = 180
    easy_nodes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", 
                  "20", "30", "40", "50", "60", "70", "80", "90", "100"]
    for i in range(len(easy_nodes) - 1):
        u, v = easy_nodes[i], easy_nodes[i + 1]
        # Remove existing edge if any
        edges = [e for e in edges if not ((e["from"] == u and e["to"] == v) or (e["from"] == v and e["to"] == u))]
        # Add easy edge - longer but NO cognitive load
        edges.append({
            "from": u, "to": v,
            "distance": 10,
            "turn_penalty": 0,
            "stairs_penalty": 0,
            "junction_penalty": 0
        })
        edges.append({
            "from": v, "to": u,
            "distance": 10,
            "turn_penalty": 0,
            "stairs_penalty": 0,
            "junction_penalty": 0
        })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "start": "1",
        "end": "100"
    }

def get_embedded_map():
    """Return the cached map, generating it only once."""
    global _cached_map
    if _cached_map is None:
        _cached_map = generate_random_map(seed=42)
    return _cached_map

def reset_map(seed=42):
    """Reset the cached map with a new seed."""
    global _cached_map
    _cached_map = generate_random_map(seed=seed)
    return _cached_map
