import os
import anthropic
from dotenv import load_dotenv

# Load .env from this file's directory explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

def generate_explanation(classical_metrics, modified_metrics, classical_path, modified_path, all_results=None):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    
    prompt = f"""
    Compare these two pathfinding routes in a cyberpunk technical style.
    Explain why the modified path is better for human navigation (lower cognitive weight).
    Cite specific numbers from the metrics.
    Keep it under 120 words in flowing prose (no bullet points).
    Penalty coefficients used: α=2, β=4, γ=1.
    
    Classical Path:
    {classical_path}
    Metrics: {classical_metrics}
    
    Modified Path:
    {modified_path}
    Metrics: {modified_metrics}
    """
    
    if api_key and api_key != "your_api_key_here":
        try:
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=256,
                system="You are an advanced navigation AI in a cyberpunk setting. Write in flowing prose without bullet points. Keep it concise.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            print("Anthropic API failed, falling back to string generation:", e)
            pass

    # Fallback to deterministic explanation
    explanation = ["The classical shortest path contains:"]
    
    if classical_metrics["totalStairs"] > 0:
        explanation.append(f"• {classical_metrics['totalStairs']} stair segments")
    if classical_metrics["totalTurns"] > 0:
        explanation.append(f"• {classical_metrics['totalTurns']} sharp turns")
    if classical_metrics["totalJunctions"] > 0:
        explanation.append(f"• {classical_metrics['totalJunctions']} complex junctions")
        
    if len(explanation) == 1:
        explanation.append("• a very straightforward route")

    explanation.append("\nThe modified path was selected because it:")
    
    reasons = []
    if modified_metrics["totalStairs"] < classical_metrics["totalStairs"]:
        reasons.append("• avoids stairs")
    if modified_metrics["totalTurns"] < classical_metrics["totalTurns"]:
        reasons.append("• reduces navigation complexity by avoiding turns")
    if modified_metrics["totalJunctions"] < classical_metrics["totalJunctions"]:
        reasons.append("• passes through fewer decision-heavy junctions")
        
    if not reasons:
        reasons.append("• provides an equivalent or simpler route based on cognitive weights")
        
    explanation.extend(reasons)
    
    # Add final recommendation if all_results provided
    if all_results:
        explanation.append("\n" + "="*50)
        explanation.append(generate_recommendation(all_results))
    
    return "\n".join(explanation)


def generate_recommendation(all_results):
    """
    Analyze all algorithm results and recommend the best path.
    Considers: cognitive weight, distance, and path length.
    """
    algorithms = [
        {"name": "Classical Dijkstra", "key": "classical", 
         "metrics": all_results["classical_metrics"], "path": all_results["classical_path"]},
        {"name": "Cognitive Dijkstra", "key": "cognitive",
         "metrics": all_results["modified_metrics"], "path": all_results["modified_path"]},
        {"name": "A* Algorithm", "key": "astar",
         "metrics": all_results["astar_metrics"], "path": all_results["astar_path"]},
        {"name": "Bellman-Ford", "key": "bellman",
         "metrics": all_results["bellman_metrics"], "path": all_results["bellman_path"]}
    ]
    
    # Find best by different criteria
    best_cognitive = min(algorithms, key=lambda x: x["metrics"]["totalWeight"])
    best_distance = min(algorithms, key=lambda x: x["metrics"]["totalDistance"])
    shortest_path = min(algorithms, key=lambda x: len(x["path"]))
    
    # Calculate a balanced score: 60% cognitive weight, 30% distance, 10% path length
    for algo in algorithms:
        m = algo["metrics"]
        algo["balanced_score"] = (
            0.6 * m["totalWeight"] + 
            0.3 * m["totalDistance"] + 
            0.1 * len(algo["path"]) * 10
        )
    
    best_overall = min(algorithms, key=lambda x: x["balanced_score"])
    
    # Build recommendation text
    rec = []
    rec.append("FINAL RECOMMENDATION")
    rec.append("-" * 30)
    
    # Show winners by category
    rec.append(f"• Lowest Cognitive Load: {best_cognitive['name']} (Weight: {best_cognitive['metrics']['totalWeight']})")
    rec.append(f"• Shortest Distance: {best_distance['name']} (Distance: {best_distance['metrics']['totalDistance']})")
    rec.append(f"• Fewest Nodes: {shortest_path['name']} ({len(shortest_path['path'])} nodes)")
    
    rec.append("")
    rec.append(f"★ RECOMMENDED PATH: {best_overall['name'].upper()}")
    rec.append(f"  Path: [{' → '.join(best_overall['path'])}]")
    rec.append(f"  Distance: {best_overall['metrics']['totalDistance']} | Cognitive Weight: {best_overall['metrics']['totalWeight']}")
    
    # Explain why
    if best_overall["key"] == "cognitive" or best_overall["key"] == "astar":
        rec.append("  Reason: Optimal balance of cognitive ease and efficiency")
    elif best_overall["key"] == "classical":
        rec.append("  Reason: Shortest physical distance with acceptable cognitive load")
    else:
        rec.append("  Reason: Best overall balance across all metrics")
    
    return "\n".join(rec)
