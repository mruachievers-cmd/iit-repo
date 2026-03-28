# Interview of Destiny - Corporate Survival RPG

## 🚀 Welcome to the Future of Job Hunting
"Interview of Destiny" is a story-driven, action RPG built for the IITH Hackathon. It blends a dystopian office environment with fast-paced combat and AI-powered NPC interactions.

### 📖 The Storyline
In a world where the corporate ladder is literal and dangerous, you are **The Candidate**. You’ve arrived for the interview of your life, but this company doesn’t want your resume—they want to see if you can survive their "Selection Process."

Explore the neon-lit corridors, solve security puzzles, and hack your way into the corporate server rooms to uncover the truth. You aren't just here to get hired—you're here to escape the corporate hive-mind. But be warned: the Board of Directors (represented by terrifying Boss entities like **Giant HR** and the **Alien Interviewer**) is watching every move.

**Fight. Survive. Get Hired... or get Archived.**

---

## 🛠️ How to Start the Project (Local System)

Follow these steps to launch the game and the AI backend on your local machine:

### **Prerequisites**
- **Python 3.x** (for the Frontend HTTP Server)
- **Node.js (v18+)** (for the AI Dialogue Backend)

### **Quick Start (Windows)**
1.  **Run the script:** Double-click on `run_all.bat` in the root folder.
2.  **Wait for servers:** The script will automatically launch:
    -   The Game Server at [http://localhost:8080/](http://localhost:8080/)
    -   The AI Chat Backend at [http://localhost:3000/](http://localhost:3000/)
3.  **Play:** Keep the terminal open and visit `http://localhost:8080/` in your browser.

---

### **Manual Start (Any OS)**
If you prefer manual control, open two terminals and run:

**Terminal 1 (Frontend):**
```bash
python -m http.server 8080
```

**Terminal 2 (AI Backend):**
```bash
cd server
node index.js
```

---

## 🎮 Controls
- **WASD / Arrow Keys**: Move around the office.
- **Enter / E**: Interact with NPCs and objects.
- **Space**: Advance dialogue or confirm.
- **Escape**: Pause/Resume the game.

## ✨ Features
- **Vector DB Integration**: NPCs use a local vector database to store and retrieve conversation history.
- **Glitch Engine**: Custom visual effects triggered by combat and hacking events.
- **Multi-State Logic**: Seamless transition between Exploration, Dialogue, Puzzle, and Battle modes.

---
**Developed for the IITH Hackathon.** 🚀
