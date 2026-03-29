def calculate_metrics(path, graph_edges):
    metrics = {
        "totalDistance": 0,
        "totalTurns": 0,
        "totalStairs": 0,
        "totalJunctions": 0,
        "totalWeight": 0 
    }

    for i in range(len(path) - 1):
        u = path[i]
        v = path[i+1]

        # Find edge
        edge_data = None
        for edge in graph_edges:
            if edge["from"] == u and edge["to"] == v:
                edge_data = edge
                break
        
        if edge_data:
            metrics["totalDistance"] += edge_data.get("distance", 0)
            metrics["totalTurns"] += edge_data.get("turn_penalty", 0)
            metrics["totalStairs"] += edge_data.get("stairs_penalty", 0)
            metrics["totalJunctions"] += edge_data.get("junction_penalty", 0)

    # Use exact formula from cognitive_weights.py => α=2, β=4, γ=1 (implied from prompt/usage context)
    # The prompt actually requested: weight = distance + α(turnPenalty) + β(stairsPenalty) + γ(junctionPenalty)
    # With Alpha = 2, Beta = 4, Gamma = 1 
    metrics["totalWeight"] = (
        metrics["totalDistance"] + 
        (2 * metrics["totalTurns"]) + 
        (4 * metrics["totalStairs"]) + 
        (1 * metrics["totalJunctions"])
    )

    return metrics
