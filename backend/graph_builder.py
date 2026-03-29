def build_graph(data):
    graph = {}

    for edge in data["edges"]:
        graph.setdefault(edge["from"], []).append(edge)
        graph.setdefault(edge["to"], []).append({
            "from": edge["to"],
            "to": edge["from"],
            "distance": edge["distance"],
            "turn_penalty": edge["turn_penalty"],
            "stairs_penalty": edge.get("stairs_penalty", 0),
            "junction_penalty": edge.get("junction_penalty", 0)
        })

    return graph
