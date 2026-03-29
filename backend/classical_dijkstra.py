import heapq
from classical_weights import compute_classical_weight

def classical_dijkstra(graph, start, logger):
    pq = [(0, start)]
    dist = {node: float("inf") for node in graph}
    parent = {node: None for node in graph}

    dist[start] = 0

    while pq:
        cost, node = heapq.heappop(pq)

        if cost > dist[node]:
            continue

        logger.log(node)

        for edge in graph[node]:
            w = compute_classical_weight(edge)
            new_cost = cost + w

            if new_cost < dist[edge["to"]]:
                dist[edge["to"]] = new_cost
                parent[edge["to"]] = node
                heapq.heappush(pq, (new_cost, edge["to"]))

    return parent
