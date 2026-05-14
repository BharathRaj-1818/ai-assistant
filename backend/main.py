from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
import psutil
import time
from datetime import datetime

from ai_engine import generate_response_stream
from intent_detector import detect_intent
from reminder_engine import save_reminder
from command_engine import process_command

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = []

class ChatRequest(BaseModel):
    message: str
    memory: dict = {}
    history: list = []

@app.get("/")
def home():
    return {"message": "NeuroAI System Running"}

from sqlalchemy.orm import Session
from fastapi import Depends
from database import crud, models
from database.database import get_db

@app.get("/api/system")
def get_system_stats():
    """Returns real-time system metrics via psutil."""
    cpu = psutil.cpu_percent(interval=0.3)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    boot_time = datetime.fromtimestamp(psutil.boot_time())
    uptime_seconds = int(time.time() - psutil.boot_time())
    uptime_str = f"{uptime_seconds // 3600}h {(uptime_seconds % 3600) // 60}m"
    
    # Network latency approximation (round trip to localhost)
    net = psutil.net_io_counters()
    
    return {
        "cpu_percent": cpu,
        "cpu_label": f"{cpu:.1f}%",
        "ram_percent": mem.percent,
        "ram_label": f"{mem.percent:.1f}%",
        "ram_used_gb": f"{mem.used / (1024**3):.1f}GB",
        "ram_total_gb": f"{mem.total / (1024**3):.1f}GB",
        "disk_percent": disk.percent,
        "disk_label": f"{disk.percent:.1f}%",
        "disk_used_gb": f"{disk.used / (1024**3):.1f}GB",
        "disk_total_gb": f"{disk.total / (1024**3):.1f}GB",
        "uptime": uptime_str,
        "status": "online"
    }

@app.get("/api/briefing")
async def get_briefing(db: Session = Depends(get_db)):
    """Generates a proactive morning briefing using real system context."""
    now = datetime.now()
    hour = now.hour
    greeting = "Good morning" if hour < 12 else ("Good afternoon" if hour < 17 else "Good evening")
    
    reminders = crud.get_reminders(db)
    events = crud.get_calendar_events(db)
    pending_tasks = [r for r in reminders if not r.get("completed")]
    
    cpu = psutil.cpu_percent(interval=0.2)
    mem = psutil.virtual_memory()
    
    task_text = f"{len(pending_tasks)} pending task(s)" if pending_tasks else "no pending tasks"
    event_text = f"{len(events)} upcoming event(s)" if events else "no scheduled events"
    
    briefing_prompt = (
        f"Generate a brief, energetic Jarvis-style morning briefing. Current time: {now.strftime('%I:%M %p, %A %B %d')}. "
        f"User has {task_text} and {event_text} today. System is running at {cpu:.1f}% CPU, {mem.percent:.1f}% RAM. "
        f"Keep it under 3 sentences. Sound like Tony Stark's Jarvis — professional, witty, and to the point. "
        f"Start with '{greeting}, Administrator.'"
    )
    
    from groq import AsyncGroq
    import os
    groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
    response = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": briefing_prompt}],
        model="llama-3.1-8b-instant",
        max_tokens=200,
        temperature=0.8
    )
    
    return {
        "briefing": response.choices[0].message.content,
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%A, %B %d"),
        "pending_tasks": len(pending_tasks),
        "events": len(events)
    }

@app.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    notes = crud.get_recent_notes(db)
    reminders = crud.get_reminders(db)
    activity = crud.get_activity_stats(db)
    calendar = crud.get_calendar_events(db)
    profile = crud.get_user_profile(db)
    
    # Real system stats
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    
    return {
        "status": "online",
        "model": "llama-3.1-8b",
        "latency": "~38ms",
        "cpu_usage": f"{cpu:.1f}%",
        "ram_usage": f"{mem.percent:.1f}%",
        "notes": notes,
        "reminders": reminders,
        "activity": activity,
        "calendar": calendar,
        "profile": profile,
        "weather": {
            "temp": "24°C",
            "condition": "Partly Cloudy",
            "location": "Hyderabad"
        }
    }


@app.delete("/api/notes/{note_id}")
def delete_note_endpoint(note_id: str, db: Session = Depends(get_db)):
    success = crud.delete_note(db, note_id)
    return {"success": success}

@app.patch("/api/reminders/{reminder_id}")
def toggle_reminder_endpoint(reminder_id: int, db: Session = Depends(get_db)):
    success = crud.toggle_reminder(db, reminder_id)
    return {"success": success}

@app.delete("/api/reminders/{reminder_id}")
def delete_reminder_endpoint(reminder_id: int, db: Session = Depends(get_db)):
    success = crud.delete_reminder(db, reminder_id)
    return {"success": success}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            req_data = json.loads(data)
            
            if req_data.get("type") == "clear":
                chat_history.clear()
                continue
            
            user_input = req_data.get("message", "")
            
            if not user_input:
                continue

            # Check commands first
            command_result = process_command(user_input)
            if command_result:
                await websocket.send_json({
                    "type": "command_result",
                    "intent": "command",
                    "content": command_result["response"],
                    "command_type": command_result.get("type", "unknown"),
                    "done": True
                })
                continue

            # NLP Intent fallback
            intent = detect_intent(user_input)
            if intent == "reminder":
                from database.database import SessionLocal
                with SessionLocal() as db:
                    crud.add_reminder(db, task=user_input)
                await websocket.send_json({
                    "type": "message",
                    "intent": intent,
                    "content": "Task added successfully to the dashboard!",
                    "done": True
                })
                continue

            elif intent == "notes":
                from database.database import SessionLocal
                with SessionLocal() as db:
                    crud.add_note(db, content=user_input)
                await websocket.send_json({
                    "type": "message",
                    "intent": intent,
                    "content": "Note saved to memory successfully!",
                    "done": True
                })
                continue

            # =========================
            # GENERAL CHAT WITH MEMORY (STREAMING)
            # =========================
            # Fetch Contextual Memory + User Profile
            from database.database import SessionLocal
            memory_str = ""
            user_profile = {}
            with SessionLocal() as db:
                notes = crud.get_recent_notes(db, limit=10)
                if notes:
                    memory_str = "\n".join([f"- {n['content']}" for n in notes])
                user_profile = crud.get_user_profile(db)
            
            chat_history.append({"role": "user", "content": user_input})
            
            full_reply = ""
            
            # Start streaming response
            await websocket.send_json({"type": "stream_start"})
            
            # Pass chat_history, memory_str, and user_profile to the engine
            async for chunk in generate_response_stream(chat_history, memory_str, user_profile):
                full_reply += chunk
                await websocket.send_json({
                    "type": "stream_chunk",
                    "content": chunk
                })
            
            chat_history.append({"role": "assistant", "content": full_reply})

            await websocket.send_json({
                "type": "stream_end",
                "done": True
            })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "content": f"System error: {str(e)}"
            })
        except:
            pass

@app.post("/chat")
async def chat_fallback(req: ChatRequest):
    # Fallback for non-websocket clients
    return {
        "intent": "fallback",
        "response": "Please connect via WebSocket for streaming."
    }