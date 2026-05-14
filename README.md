# 🧠 NeuroAI — Autonomous AI Assistant OS

NeuroAI is a high-performance, autonomous AI operating system inspired by the "Jarvis" concept. It combines real-time system monitoring, multi-agent AI intelligence, and a cinematic user interface to provide a truly agentic experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)
![React](https://img.shields.io/badge/react-18.0%2B-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/fastapi-v0.100%2B-009688.svg)

---

## ✨ Key Features

### 🤖 Multi-Agent AI Architecture
NeuroAI uses a specialized multi-agent routing system to handle different types of requests with precision:
- **Core Agent**: Handles general conversation and personality.
- **Code Specialist**: Writes, debugs, and explains complex code.
- **Research Specialist**: Performs deep web searches and synthesizes data.
- **Task Specialist**: Manages your schedule, reminders, and productivity.

### 🖥️ Real-Time System Monitoring
A built-in hardware interface tracks your PC's performance (CPU, RAM, Disk, Uptime) and integrates these metrics into the AI's contextual awareness.

### 🌅 Proactive Morning Briefings
Wake up to a Jarvis-style briefing that summarizes your day, pending tasks, and system health in a professional, witty tone.

### 🎙️ Voice & Wake-Word Activation
Hands-free interaction with voice-to-text integration and wake-word detection for a seamless "Starman" experience.

### 🗄️ Contextual Memory Core
NeuroAI remembers your preferences, previous conversations, and notes, allowing for deeply personalized interactions.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion (for animations).
- **Backend**: FastAPI (Python), Groq Llama 3.1 (LLM), SQLAlchemy (Database).
- **Hardware Integration**: `psutil` for real-time system telemetry.
- **AI Engine**: Groq Cloud API for ultra-fast, low-latency responses.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js (v16+)
- Groq API Key (Get one at [groq.com](https://groq.com))

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

#### Run the Server
```bash
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
ai-assistant/
├── backend/                # FastAPI Python Server
│   ├── agents/             # Multi-agent logic
│   ├── database/           # SQLite & SQLAlchemy models
│   ├── main.py             # Server entry point
│   └── ai_engine.py        # Core AI routing logic
├── frontend/               # React Vite Application
│   ├── src/
│   │   ├── components/     # UI Components (Jarvis Widgets)
│   │   ├── pages/          # Chat, History, Settings
│   │   └── store/          # State management
└── .gitignore              # Git ignore rules
```

---

## 🛡️ Security
NeuroAI follows best practices for security:
- **Environment Variables**: API keys are never hardcoded and are loaded via `.env`.
- **Git Safety**: The `.gitignore` file is pre-configured to prevent sensitive data from being pushed to public repositories.

---

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to enhance NeuroAI's capabilities.

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ by [BharathRaj-1818](https://github.com/BharathRaj-1818)*
