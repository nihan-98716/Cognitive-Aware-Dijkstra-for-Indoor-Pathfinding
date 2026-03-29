# Quick Start Guide

Get the Cognitive Navigation System running in under 5 minutes!

## ⚡ Fast Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/yourusername/cognitive-navigation.git
cd cognitive-navigation
```

### 2. Install Dependencies
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install flask flask-cors pillow python-dotenv anthropic python-docx
```

### 3. Start Backend
```bash
cd backend
python app.py
```
✅ Backend running at `http://127.0.0.1:5000`

### 4. Start Frontend (New Terminal)
```bash
cd frontend
python -m http.server 8000
```
✅ Frontend running at `http://127.0.0.1:8000`

### 5. Open Browser
Navigate to `http://127.0.0.1:8000` and enjoy!

---

## 🎮 First Use

1. **Default nodes**: Start=1, End=100 (pre-filled)
2. Click **"INITIALIZE ROUTING"**
3. Watch the algorithms compete!
4. Toggle paths on/off with checkboxes
5. Read the AI explanation at the bottom

---

## 🔧 Optional: AI Explanations

For enhanced route explanations:

1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Create `backend/.env`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
3. Restart backend server

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.9+)
- Install missing packages: `pip install flask flask-cors`

**Frontend shows errors?**
- Ensure backend is running first
- Check browser console for CORS issues
- Try Chrome/Firefox (best WebGL support)

**Can't see 3D scene?**
- Enable WebGL in browser settings
- Update graphics drivers
- Try different browser

---

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API: `curl http://127.0.0.1:5000/map`
- Customize cognitive weights in `backend/cognitive_weights.py`
- Try different start/end node combinations

---

## 💡 Pro Tips

- Click nodes in 3D to select them
- Use mouse to rotate/zoom the scene
- Compare metrics in side panels
- Watch traversal animation to see algorithm behavior

Happy navigating! 🧭
