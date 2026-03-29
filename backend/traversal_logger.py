class TraversalLogger:
    def __init__(self):
        self.steps = []

    def log(self, node):
        self.steps.append(node)
