import os
from PIL import Image, ImageDraw

def generate_image(nodes, path):
    # Get project root (one level above backend)
    project_root = os.path.dirname(os.path.dirname(__file__))

    # Ensure output directory exists
    output_dir = os.path.join(project_root, "output")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "result.png")

    img = Image.new("RGB", (600, 400), "black")
    draw = ImageDraw.Draw(img)

    for node, pos in nodes.items():
        draw.ellipse(
            (pos["x"]-6, pos["y"]-6, pos["x"]+6, pos["y"]+6),
            fill="white"
        )
        draw.text((pos["x"]+8, pos["y"]+8), node, fill="white")

    for i in range(len(path) - 1):
        a = nodes[path[i]]
        b = nodes[path[i+1]]
        draw.line(
            (a["x"], a["y"], b["x"], b["y"]),
            fill="orange",
            width=4
        )

    img.save(output_path)
    return output_path
