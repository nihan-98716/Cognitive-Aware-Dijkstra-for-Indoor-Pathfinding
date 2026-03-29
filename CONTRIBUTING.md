# Contributing to Cognitive Navigation System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Areas for Contribution](#areas-for-contribution)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the project and community

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- Git
- Basic understanding of Flask, pathfinding algorithms, or Three.js (depending on contribution area)

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cognitive-navigation.git
   cd cognitive-navigation
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cognitive-navigation.git
   ```

---

## 💻 Development Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
pip install pytest black flake8  # Development tools
```

### 3. Verify Setup

```bash
# Start backend
cd backend
python app.py

# In new terminal, test API
curl http://127.0.0.1:5000/map
```

---

## 🤝 How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Ensure you're using the latest version
3. Test with minimal reproduction steps

**Bug Report Template:**
```markdown
**Description:** Clear description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:** What should happen

**Actual Behavior:** What actually happens

**Environment:**
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Python Version: [e.g., 3.11.5]
- Browser: [e.g., Chrome 120, Firefox 121]

**Screenshots:** If applicable

**Additional Context:** Any other relevant information
```

### Suggesting Features

Feature requests are welcome! Please provide:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: What alternatives have you considered?
- **Impact**: Who benefits from this feature?

### Submitting Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes following [coding standards](#coding-standards)

3. Test your changes thoroughly

4. Commit with clear messages:
   ```bash
   git commit -m "Add feature: description of what you added"
   git commit -m "Fix: description of what you fixed"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request on GitHub

---

## 📝 Coding Standards

### Python Code Style

We follow PEP 8 with some modifications:

```python
# Use descriptive variable names
user_position = (x, y, z)  # Good
up = (x, y, z)  # Bad

# Add docstrings to functions
def compute_weight(edge, alpha=2.0, beta=4.0, gamma=1.0):
    """
    Compute cognitive-aware edge weight.
    
    Args:
        edge (dict): Edge with distance and penalty fields
        alpha (float): Turn penalty coefficient
        beta (float): Stairs penalty coefficient
        gamma (float): Junction penalty coefficient
    
    Returns:
        float: Computed cognitive weight
    """
    return edge["distance"] + alpha * edge["turn_penalty"]

# Use type hints when helpful
def dijkstra(graph: dict, start: str, goal: str) -> list[str]:
    pass
```

### JavaScript Code Style

```javascript
// Use const/let, not var
const nodeCount = 100;
let currentPath = [];

// Use meaningful function names
function animateTraversal(nodes) { /* ... */ }

// Add comments for complex logic
// Calculate Euclidean distance in 3D space
const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
```

### Code Formatting

Run before committing:
```bash
# Format Python code
black backend/

# Check Python style
flake8 backend/ --max-line-length=100

# Check for issues
pylint backend/
```

### Documentation

- Add docstrings to all public functions and classes
- Update README.md if adding features
- Add inline comments for complex algorithms
- Document API endpoints in API section

---

## 🧪 Testing Guidelines

### Writing Tests

```python
# tests/test_dijkstra.py
import pytest
from backend.dijkstra import dijkstra
from backend.graph_builder import build_graph

def test_dijkstra_simple_path():
    """Test Dijkstra on a simple 3-node graph."""
    graph = {
        "A": [{"to": "B", "distance": 5}],
        "B": [{"to": "C", "distance": 3}],
        "C": []
    }
    path = dijkstra(graph, "A", "C")
    assert path == ["A", "B", "C"]

def test_dijkstra_with_cognitive_weights():
    """Test cognitive-aware routing."""
    # Test implementation
    pass
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_dijkstra.py

# Run with coverage
pytest --cov=backend tests/
```

### Test Coverage

- Aim for 80%+ coverage on new code
- Test edge cases and error conditions
- Test both success and failure paths

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings generated

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. Maintainer reviews code within 3-5 days
2. Address feedback and update PR
3. Once approved, maintainer merges
4. Branch is deleted after merge

---

## 🎯 Areas for Contribution

### High Priority

1. **Additional Algorithms**
   - D* / D* Lite
   - Theta* (any-angle pathfinding)
   - Jump Point Search

2. **Map Import Tools**
   - GeoJSON parser
   - OpenStreetMap (OSM) indoor data
   - CAD file converter (DXF, DWG)

3. **User Preferences**
   - Accessibility profiles (avoid stairs, prefer elevators)
   - Speed vs. simplicity slider
   - Save/load preference profiles

4. **Testing**
   - Unit tests for algorithms
   - Integration tests for API
   - Frontend UI tests

### Medium Priority

5. **Mobile Responsiveness**
   - Touch controls for 3D scene
   - Responsive layout
   - Progressive Web App (PWA)

6. **Performance Optimization**
   - Faster graph generation
   - Caching strategies
   - Lazy loading for large maps

7. **Documentation**
   - Video tutorials
   - Algorithm explanations
   - Use case examples

### Low Priority

8. **Additional Features**
   - Multi-destination routing
   - Real-time crowd density
   - Historical route analytics

---

## 📚 Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Pathfinding Algorithms](https://www.redblobgames.com/pathfinding/)

### Learning
- [Dijkstra's Algorithm Explained](https://www.youtube.com/watch?v=GazC3A4OQTE)
- [A* Pathfinding Tutorial](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Cognitive Load Theory](https://en.wikipedia.org/wiki/Cognitive_load)

---

## 💬 Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Pull Requests**: Code contributions

---

## 🏆 Recognition

Contributors are recognized in:
- README.md acknowledgements section
- GitHub contributors page
- Release notes for significant contributions

---

## ❓ Questions?

If you have questions not covered here:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with the "question" label

---

Thank you for contributing to the Cognitive Navigation System! 🎉

Together we're making indoor navigation smarter and more human-friendly.
